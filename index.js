const cheerio = require('cheerio')
const axios = require('axios')
const prompt = require("prompt-sync")({ sigint: true });
const querystring = require('querystring')
const {connectDB} = require('./config/db')
const Seller = require('./models/Seller.model')
const Summary = require('./models/Summary.model')
const Rater = require('./models/Rater.model')


connectDB()


let options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17.13 (KHTML, like Gecko) Chrome/57.0.2940.56 Safari/537.17.13'
    }
  }

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  
async function scrapeData() {

    await sleep(2000)

    let responseData;

    const sellerUrl = prompt("Enter seller URL : ");

    console.log(`___ Scraping feedback summary table ___`)

    try {

        const { data } = await axios.get(sellerUrl, options)

        responseData = data

    } catch (error) {
        console.log(error)
        return
    }
    
    const $ = cheerio.load(responseData);
    const tableData = $('table[id="feedback-summary-table"]').find('tbody tr')

    const newSeller = await Seller.create({})

    tableData.each(async (idx, el) => { 

        if(idx == 0) return

        const newSummary = await Summary.create({
            thirty_days_summary: $(el).children('td').eq(1).children('span').text(),
            ninety_days_summary: $(el).children('td').eq(2).children('span').text(),
            twelve_months_summary: $(el).children('td').eq(3).children('span').text(),
            lifetime_summary: $(el).children('td').eq(4).children('span').text()
        })

        if(idx == 1) {
            newSeller.set({
                positive: newSummary.dataValues.id
            })
        } else if (idx == 2) {
            newSeller.set({
                neutral: newSummary.dataValues.id
            })
        } else if (idx == 3) {
            newSeller.set({
                negative: newSummary.dataValues.id
            })
        } else if (idx == 4) {
            newSeller.set({
                count: newSummary.dataValues.id
            })
        }

        await newSeller.save()

    });

    // extract marketplace ID
    const marketplaceIDurl = $('a:contains("Contact this seller")').attr('href')

    var url = new URL(marketplaceIDurl);
    var url2 = new URL(sellerUrl);
    var marketID = url.searchParams.get("marketplaceID");
    var sellerId = url2.searchParams.get("seller")

    await sleep(3000)

    fetchFeedback(sellerId, marketID, newSeller.id)
    
}

//seller, marketplaceID, sellerId

async function fetchFeedback(sellerId, marketplaceID, sellerDbID){

    let pageNumber = 0;

    console.log(`___ fetching rating page ${pageNumber} ___`)

    const {data} = await axios.post('https://www.amazon.in/sp/ajax/feedback',
        querystring.stringify({
            seller: sellerId,
            marketplaceID: marketplaceID,
            pageNumber
        }), {
          headers: { 
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17.13 (KHTML, like Gecko) Chrome/57.0.2940.56 Safari/537.17.13"
          }
        });

    for (const rater of data.details) {

        const newRater = await Rater.create({
            rater: rater.rater,
            rating: rater.rating,
            date: new Date(rater.ratingData.date),
            expandedText: rater.ratingData.text.expandedText,
            raterProfile: rater.raterProfileUrl ? rater.raterProfileUrl.slice(26) : null,
            seller: sellerDbID
        })

    }

    

    let continueLoop = data.hasNextPage

    while(continueLoop) {

        pageNumber += 1;

        console.log(`___ fetching rating page ${pageNumber} ___`)

        const {data} = await axios.post('https://www.amazon.in/sp/ajax/feedback',
        querystring.stringify({
            seller: sellerId,
            marketplaceID: marketplaceID,
            pageNumber
        }), {
          headers: { 
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17.13 (KHTML, like Gecko) Chrome/57.0.2940.56 Safari/537.17.13"
          }
        });

        for (const rater of data.details) {

            const newRater = await Rater.create({
                rater: rater.rater,
                rating: rater.rating,
                date: new Date(rater.ratingData.date),
                expandedText: rater.ratingData.text.expandedText,
                raterProfile: rater.raterProfileUrl ? rater.raterProfileUrl.slice(26) : null,
                seller: sellerDbID
            })
    
        }

    continueLoop = data.hasNextPage

    await sleep(2000)

    }
    

}

scrapeData()
