import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import "dotenv/config";

const app=express();
const PORT = (process.env.PORT ||  3000 );

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true }));


let movieByGenreDetails = [];
let movieDetails = [];
let seriesDetails = [];

app.get("/", async(req,res) => {

    if(movieDetails.length === 0) {
        try {
            const response = await axios.get("https://imdb8.p.rapidapi.com/title/get-most-popular-movies", {
                params: {
                    homeCountry: 'IN',
                    purchaseCountry: 'IN',
                    currentCountry: 'IN'
                  },
                  headers: {
                    'X-RapidAPI-Key': apikey,
                    'X-RapidAPI-Host': apihost
                  }
            });
    
            const response1 = await axios.get("https://imdb8.p.rapidapi.com/title/get-most-popular-tv-shows", {
                params: {
                    homeCountry: 'IN',
                    purchaseCountry: 'IN',
                    currentCountry: 'IN'
                  },
                  headers: {
                    'X-RapidAPI-Key': apikey,
                    'X-RapidAPI-Host': apihost
                  }
            });
    
    
            //console.log(response.data);
            //console.log(response1.data);
            let mostPopularMovies = response.data;
            let mostPopularSeries = response1.data;
            
            for(let i=0;i<3;i++) {
                let mvid=mostPopularMovies[i].slice(7,-1);
                console.log(mvid);
                let sid = mostPopularSeries[i].slice(7,-1);
                console.log(sid);
                const response= await axios.get("https://imdb8.p.rapidapi.com/title/get-details",{
                        params : {
                            tconst : mvid
                        },
                        headers :{
                            'X-RapidAPI-Key': apikey,
                            'X-RapidAPI-Host' : apihost
                        }
                    });
    
                const movie = {
                    name : response.data.title,
                    year : response.data.year,
                    image : response.data.image.url
                }
                movieDetails.push(movie);
    
                const response1= await axios.get("https://imdb8.p.rapidapi.com/title/get-details",{
                        params : {
                            tconst : sid
                        },
                        headers :{
                            'X-RapidAPI-Key': apikey,
                            'X-RapidAPI-Host' : apihost
                        }
                    });
    
                const serie = {
                    name : response1.data.title,
                    year : response1.data.year,
                    image : response1.data.image.url
                }
                seriesDetails.push(serie);
    
            }
        } catch (error) {
            console.error(error);
        }
    }
    if(movieByGenreDetails.length === 0) {
        console.log("first");
        res.render("home.ejs" , {
            movies : movieDetails,
            series : seriesDetails
        });
    } else {
        res.render("home.ejs" , {
            movies : movieDetails,
            series : seriesDetails,
            genre : movieByGenreDetails
        });
    }

});

app.get("/genre/:name", async(req,res)=> {
    movieByGenreDetails = [];
    let genre = req.params.name;
    console.log(genre);
    try {
        const response = await axios.get("https://imdb8.p.rapidapi.com/title/v2/get-popular-movies-by-genre", {
            params: {
                genre: genre,
                limit: '5'
              },
              headers: {
                'X-RapidAPI-Key': apikey,
                'X-RapidAPI-Host': apihost
              }
        });
        //console.log(response.data);
        

        for(let i=0;i<3;i++) {
            let mvid=response.data[i].slice(7,-1);
            console.log(mvid);
            const response1= await axios.get("https://imdb8.p.rapidapi.com/title/get-details",{
                params : {
                    tconst : mvid
                },
                headers :{
                    'X-RapidAPI-Key': apikey,
                    'X-RapidAPI-Host' : apihost
                }
            });
        
                    const movie = {
                        ge : genre,
                        name : response1.data.title,
                        year : response1.data.year,
                        image : response1.data.image.url
                    }
                    movieByGenreDetails.push(movie);
        }
    } catch (error) {
        console.error(error);
    }
    res.redirect("/")
});

app.get("/search", (req,res) => {
    res.render("index.ejs");
});


const apikey=process.env.APIKEY;
const apihost='imdb8.p.rapidapi.com';


app.post("/search", async (req,res)=> {
    let title=req.body.title;
    try {
        const response= await axios.get("https://imdb8.p.rapidapi.com/title/find",{
            params: {
                q : title,
                
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
                    if(movie.length== 3)
                        break;
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

app.listen(PORT, ()=> {
    console.log(`server is running on port ${PORT}`);
});
