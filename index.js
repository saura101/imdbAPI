import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app=express();
const port=3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true }));

app.get("/", (req,res) => {
    res.render("index.ejs");
});


const apikey='insert apikey'; 
const apihost='imdb8.p.rapidapi.com';


app.post("/", async (req,res)=> {
    let title=req.body.title;
    try {
        const response= await axios.get("https://imdb8.p.rapidapi.com/title/find",{
            params: {
                q : title,
                limit : 15
            }, 
            headers :{
                'X-RapidAPI-Key': apikey,
                'X-RapidAPI-Host' : apihost

            }
        });
        console.log("hello ji kaise ho saare");
        //console.log(response.data.results);
        const result=response.data.results;
        let movie=[];
        let rating=[];
        for(let i=0;i<result.length;i++)
        {
            if(result[i].titleType)
            {
                if(result[i].titleType=='movie')
                {
                    let mvid=result[i].id.slice(7,-1);
                    const response1= await axios.get("https://imdb8.p.rapidapi.com/title/get-ratings",{
                    params : {
                        tconst : mvid
                    },
                    headers :{
                        'X-RapidAPI-Key': apikey,
                    'X-RapidAPI-Host' : apihost

                    }
                    });
                    rating.push(response1.data.rating);
                    movie.push(result[i]);
                    if(movie.length==3)
                        break;
                }
            }
        }
        console.log(movie);
        res.render("index.ejs",{movie: movie,
            rate:rating
        });
    } catch(error) {
        console.log(error.message);
        res.render("index.ejs", {error : error.message});
    }
});

app.listen(port, ()=> {
    console.log(`server is running on port ${port}`);
});