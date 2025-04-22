const express = require('express')

const app = express()
const cors = require('cors')
app.use(express.json())

app.use(cors({
    origin: 'http://localhost:3000', // your frontend origin
    credentials: true // if you're using cookies
  }))

require('dotenv').config()
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})

const multer = require('multer')
const {CloudinaryStorage} = require('multer-storage-cloudinary')

const path = require('path')
const dbPath = path.join(__dirname, 'userData.db')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const PORT = process.env.PORT || 3000

let db = null

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'categories',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
})

const upload = multer({storage: storage})

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(PORT, () => {
      console.log('Server running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.messsage}`)
  }
}

intializeDbAndServer()

//Add User API
app.post('/register', async (request, response) => {
    const {username, name, password, gender} = request.body
  
    const hashedPassword = await bcrypt.hash(password, 10)
  
    const selectUserQuery = `
    SELECT 
      * 
    FROM
      user
    WHERE
     username = "${username}";`
  
    const dbUser = await db.get(selectUserQuery)
  
    if (dbUser === undefined) {
      if (password.length >= 5) {
        const createUserQuery = `
        INSERT INTO
          user (username, name, password, gender)
          VALUES ("${username}", "${name}", "${hashedPassword}", "${gender}");
        `
  
        await db.run(createUserQuery)
        response.json('User created successfully')
      } else {
        response.status(400)
        response.json('Password is too short')
      }
    } else {
      response.status(400)
      response.json('User already exists')
    }
  })

  //Get Login API
app.post('/login', async (request, response) => {
    const {username, password} = request.body
  
    const getUserQuery = `
      SELECT
        *
      FROM
        user
      WHERE
        username = "${username}";
    ` 
    const dbUser = await db.get(getUserQuery)
  
    if (dbUser === undefined) {
       response.status(400)
      response.json('Invalid user')
    } else {
      const isPasswordMatched = await bcrypt.compare(password, dbUser.password)
  
      if (isPasswordMatched === true) {
        const payload = {
            id: dbUser.id,
            username: dbUser.username,
            name: dbUser.name,
            gender: dbUser.gender,
          }
          const jwtToken = jwt.sign(payload, 'userDetails')
          response.json(jwtToken)
      } else {
        response.status(400)
        response.json('Invalid password')
      }
    }
  })

  //Middleware Function
  const authencationToken = (request, response, next) => {
    let jwtToken
    const authHeader = request.headers['authorization']
  
    if (authHeader !== undefined) {
      jwtToken = authHeader.split(' ')[1]
    }
  
    if (jwtToken === undefined) {
      response.status(401)
      response.json('Authenctication error')
    } else {
      jwt.verify(jwtToken, 'userDetails', async (error, payload) => {
        if (error) {
          response.status(401)
          response.json('Invalid JWT Token')
        } else {
          request.payload = payload
          next()
        }
      })
    }
  }

  //Get all categories API
  app.get('/categories', authencationToken, async (request, response) => {
    const getAllCategoriesQuery = `
        SELECT
            *
        FROM
            category
        ORDER BY
            category_id;
    `

    const allCategories = await db.all(getAllCategoriesQuery)

    response.status(200)
    response.json(allCategories)
  })

  //Add new category API
  app.post('/categories', authencationToken, upload.single('categoryImage'), async (request, response) => {
    const {categoryName, itemCount} = request.body
    const categoryImage = request.file.path

    const getCategoryQuery = `
        SELECT
            *
        FROM
            category
        WHERE
            category_name = '${categoryName}';
    `

    const currentCategory = await db.get(getCategoryQuery)

    if (currentCategory === undefined) {
        const addCategoryQuery = `
            INSERT INTO category (
                category_name, item_count, category_image
            )
            VALUES ('${categoryName}', ${itemCount}, '${categoryImage}');
        `

        await db.run(addCategoryQuery)
        response.status(200)
        response.json("Category added successfully")
    } else {
        response.status(400)
        response.json("Category already exists")
    }
  })

//Updating Category API
app.put('/categories/:categoryId', authencationToken, upload.single('categoryImage'), async (request, response) => {
    const {categoryId} = request.params
  
    const getExistingCategoryQuery = `
      SELECT 
        *
      FROM
        category
      WHERE
        category_id = ${categoryId};    
    `
  
    const existingCategory = await db.get(getExistingCategoryQuery)
  
    const {
      categoryName = existingCategory.category_name,
      itemCount = existingCategory.item_count,
    } = request.body

    let categoryImage = existingCategory.category_image

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload_stream(
          { resource_type: 'image' },
          (error, result) => {
            if (error) {
              throw new Error('Failed to upload image');
            }
            categoryImage = result.secure_url;
          }
        );
        const bufferStream = new Readable();
        bufferStream.push(request.file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(result);
      } catch (error) {
        return response.status(500).json({ error: error.message });
      }
    }
  
    const updateCategoryQuery = `
      UPDATE
        category
      SET
        category_name = "${categoryName}",
        item_count = "${itemCount}",
        category_image = "${categoryImage}"
      WHERE
        category_id = ${categoryId};    
    `
  
    await db.run(updateCategoryQuery)
  
    const updatedCategoryQuery = `
      SELECT
        *
      FROM
        category
      WHERE
        category_id = ${categoryId};    
    `
  
    const updatedCategory = await db.get(updatedCategoryQuery)
  
    if (existingCategory.category_name !== updatedCategory.category_name) {
      response.json('CategoryName Updated')
    } else if (existingCategory.item_count !== updatedCategory.item_count) {
      response.json('ItemCount Updated')
    } else {
      response.json('CategoryImage Updated')
    }
  })