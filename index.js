var AWS = require('aws-sdk');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
    if (req.query.ip == undefined || req.query.ip == '') {
        res.send('Hello World!');
    } else {
        if (ValidateIPaddress(req.query.ip)) {
            AWS.config.update({ accessKeyId: process.env.AWSIAMKEY, secretAccessKey: process.env.AWSIAMSECRET });
            AWS.config.update({ region: process.env.AWSREGION });
            let route53 = new AWS.Route53();
            let params = {
                HostedZoneId: process.env.AWSHOSTEDZONE,
                ChangeBatch: {
                    Changes: [{
                        Action: 'UPSERT',
                        ResourceRecordSet: {
                            Name: process.env.AWSDYNDOMAIN,
                            ResourceRecords: [{ Value: req.query.ip }],
                            Type: 'A',
                            TTL: 300,
                        }
                    }],
                    Comment: 'updated by fritz.box'
                }
            };
            route53.changeResourceRecordSets(params, function (err, data) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    console.log(data);
                    console.log('updated with ip ' + req.query.ip);
                    res.status(200).send('updated with ip ' + req.query.ip);
                }
            })
        } else {
            res.status(400).send('invalid ip given');
        }
    }
});

app.listen(4000, function () {
    if (typeof (PhusionPassenger) !== 'undefined') {
        console.log('App running inside Passenger.');
    } else {
        console.log('App running on port 4000');
    }
});

function ValidateIPaddress(ipaddress) {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
        return (true)
    }
    console.log('invalid ip adress ' + ipaddress)
    return (false)
}  