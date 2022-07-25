const cheerio = require('cheerio')
const axios = require('axios')
const {connectDB} = require('./config/db')
// const Seller = require('./models/Seller.model')
// const Summary = require('./models/Summary.model')

connectDB()

let options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17.13 (KHTML, like Gecko) Chrome/57.0.2940.56 Safari/537.17.13'
    }
  }
const postData = {
    seller: 'A361BWIDHO7MAM',
    marketplaceID: 'A21TJRUUN4KGV',
    pageNumber: 1
}
const postOptions = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: postData,
    url: 'https://www.amazon.in/sp/ajax/feedback',
  };
  
async function scrapeData() {

    let responseData;

    try {

        const { data } = await axios.get('https://www.amazon.in/sp?seller=A361BWIDHO7MAM', options)

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
}

async function fetchFeedback(){

    try {

    const response = await axios(postOptions)
    console.log(response)

} catch (error) {
    console.log(error)
}


    

}

// scrapeData()

fetchFeedback()