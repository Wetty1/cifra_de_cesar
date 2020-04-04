const fs = require('fs')
const express = require('express')
const axios = require('axios')
const crypto = require('crypto')
const request = require('request')
require('dotenv').config()

const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const token = process.env.TOKEN

/* Configura a  */
const api = axios.create({
    baseURL: process.env.API
})
const app = express()

/**
 * /getjson
 * 
 */
app.get('/getjson', async (req, res) => {
    await api.get(`generate-data?token=${token}`)
    .then(function (response) {
    
        console.log(response.data);
        var json = JSON.stringify(response.data)
    
        fs.writeFile('./data/answer.json', json, 'utf8', (err) => {
            console.error(err)
        })
    })
    .catch(function (error) {
        console.log(error);
        res.send('Error')
    })

    res.send('Sucesso')
})

app.get('/sendjson', async (req, res) => {
    const options = {
        method: "POST",
        url: `${process.env.API}submit-solution?token=${process.env.TOKEN}`,
        headers: {
          "Content-Type": "multipart/form-data"
        },
        formData: {
          answer: fs.createReadStream("./data/answer.json")
        }
    }

    console.log(options.url);
    request(options, (err, res, body) => {
        if(err) console.error(err);
        console.log(res);
        console.log(body);
    })
})

app.get('/decode', async (req, res) => {

    let data = ""
    let cifrado = ""
    let ROT = ""

    const file = await fs.readFile('./data/answer.json', 'utf8', function readFileCallback(err, json) {
        if(err) {
            console.log(err)
        } else {
            data = JSON.parse(json)
            cifrado = data.cifrado
            ROT = data.numero_casas
        
            console.log(cifrado, ROT);
        
            console.log(file);
        
            cifrado = cifrado.toLowerCase()
            
            let decode = ""
            for(let i = 0; i < cifrado.length; i++) {
        
                if(alfabeto.search(cifrado[i].toUpperCase()) < 0) {
                    decode += cifrado[i]
                } else if (cifrado[i] === ".") 
                    decode += cifrado[i]
                else{
                    let positionDecode = alfabeto.search(cifrado[i].toLocaleUpperCase()) - ROT
                    if (positionDecode < 0) {
                        decode += alfabeto[positionDecode + 26] // -1 + 26 = 25
                    }else if (positionDecode > 25){
                        decode += alfabeto[positionDecode - 26] // 26 - 26 = 0
                    }else{
                        decode += alfabeto[positionDecode]
                    }
                }              
            }
        
            decode = decode.toLowerCase()
            console.log(decode)

            data.decifrado = decode

            var getInsecureSHA1 = function(input){
                return crypto.createHash('sha1').update(decode).digest('hex')
            }

            data.resumo_criptografico = getInsecureSHA1()

            console.log(data.resumo_criptografico);

            let dataJson = JSON.stringify(data)
            fs.writeFile('./data/answer.json', dataJson, 'utf8', (err) => {
                console.error(err)
            })
            
            res.send(decode + "<br> " + cifrado)
        }
    })
})

app.listen(3000)

