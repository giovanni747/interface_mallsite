import mysql from 'mysql2'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

export async function getMembers(){
    const [rows] = await pool.query("SELECT * FROM members") 
    return rows
}
export async function allCount(){
    const [result] = await pool.query(`
        SELECT COUNT(*) as count 
        FROM members 
        WHERE is_admin = 0
    `);
    return result[0].count;
} 
export async function allAdmin(){
    const [rows] = await pool.query("SELECT COUNT(*) as total FROM members WHERE is_admin = 1") 
    return rows[0].total;
} 

export async function getMember(name, password) {
    const [rows] = await pool.query(`
        SELECT *
        FROM members
        WHERE name = ?
    `, [name]) // prepared statement
    
    const user = rows[0];
    if (!user) {
        return null;
    }
    const match = await bcrypt.compare(password, user.password);
    return match ? user : null;
}
export async function createMember(name, age,gender,address, phone_number,email,password, is_admin = 0){
    const hashedPassword = await bcrypt.hash(password, 11);
    const [res] = await pool.query(`
    INSERT INTO members (name, age, gender, address, phone_number, email, password, is_admin)
    VALUES(?,?,?,?,?,?,?,?)
    `, [name, age, gender, address, phone_number, email, hashedPassword, is_admin])
    const newMemberId = res.insertId;
    const [rows] = await pool.query(`
        SELECT *
        FROM members
        WHERE id = ?
    `, [newMemberId]);
    return rows[0];
}
export async function deleteMember(id){
    const [res] = await pool.query(`
    DELETE 
    FROM members
    WHERE id = ?
    `,[id])
    return res
}
export async function updateMember(id, data) {
    // Get current user data
    const [currentUser] = await pool.query('SELECT * FROM members WHERE id = ?', [id]);
    if (!currentUser || currentUser.length === 0) {
        throw new Error('User not found');
    }

    // Merge existing data with updates
    const updatedData = {
        name: data.name || currentUser[0].name,
        email: data.email || currentUser[0].email,
        age: data.age || currentUser[0].age,
        gender: data.gender || currentUser[0].gender,
        address: data.address || currentUser[0].address,
        phone_number: data.phone_number || currentUser[0].phone_number
    };

    const [result] = await pool.query(`
        UPDATE members 
        SET name = ?, email = ?, age = ?, gender = ?, address = ?, phone_number = ?
        WHERE id = ?
    `, [updatedData.name, updatedData.email, updatedData.age, updatedData.gender, 
        updatedData.address, updatedData.phone_number, id]);
    
    return result;
}

