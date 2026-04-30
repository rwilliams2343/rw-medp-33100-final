var express = require('express');
var router = express.Router();
const { ObjectId, Timestamp } = require('mongodb')

/* GET users listing. */
router.get('/', async function (req, res, next) {
    try {
        console.log(req.query.search)
        const db = req.app.locals.db;
        const entries = await db.collection('entries')
            .aggregate([
                {
                    $match: {
                        $or: [
                            {game_name: { $regex: req.query.search, $options: 'i' }},
                            {author: { $regex: req.query.search, $options: 'i' }},
                            {platform: { $regex: req.query.search, $options: 'i' }},
                            {entry_text: { $regex: req.query.search, $options: 'i' }}
                        ]
                    }
                },
                {
                    $sort: {
                        date_created: -1
                }
                
                },
                {
                    $project: {
                        date_created: { $toDate: "$date_created" },
                        date_created: {$dateToString: {format: '%b %d %Y', date: '$date_created'}},
                        game_name: 1,
                        author: 1,
                        image_url: 1,
                        platform: 1,
                        entry_text: 1
                    }
                }
            ])
            .toArray();
        
            res.json(entries)
        } catch (error) {
            console.log('error!');
            res.status(500).send('An error occurred');
        }
});

router.post('/', async function (req, res) {
    try {
        const db = req.app.locals.db;
        const newEntry = {
            game_name: req.body.game_name,
            image_url: req.body.image_url,
            author: req.body.author,
            platform: req.body.platform,
            entry_text: req.body.entry_text,
            date_created: new Date()
            //new Timestamp({ t: Math.floor(Date.now() / 1000), i: 0 })
        }
        await db.collection('entries')
            .insertOne(newEntry)
        console.log('entry successfully added!')

        res.send('entry successfully added!')
    } catch (error) {
        res.status(500).send('error when adding new entry!')
        console.log('error when adding new entry!')
    }
})

router.put('/', async function(req, res){
    console.log('pulling!~')
    try {
        const db = req.app.locals.db;
        await db.collection('entries')
            .updateOne(
                {_id: new ObjectId(req.body.id)},
                {$set: {
                    game_name: req.body.game_name,
                    image_url: req.body.image_url,
                    entry_text: req.body.entry_text,
                    date_created: new Date()
                    //new Timestamp({ t: Math.floor(Date.now() / 1000), i: 0 })
                }}
            )
        //console.log(test)
    } catch (error) {
        res.status(500).send('error when updating!!!')
        console.log('error when updating!!!')
    }
})

router.delete('/:id', async function (req, res){
    try {
        const db = req.app.locals.db;
        await db.collection('entries')
            .deleteOne({_id: new ObjectId(req.params.id)})
    } catch (error) {
        res.status(500).send('error when deleting data!!!')
        console.log('error when deleting data!!!')
    }
})

module.exports = router;
