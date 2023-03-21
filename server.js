const express = require('express');
const sqlite3 = require('sqlite3');


const app = express();
app.use(express.static('static'));
app.use(express.json({limit: '50mb'}));
const port = 4000;
app.listen(port, () => {
  console.log(`listening at port ${port}`);
});
//app.use(express.bodyParser({limit: '50mb'}));

let db = new sqlite3.Database('EPYW.db', (err)=> {
	if (err) {
		console.error(err.message);
	} else {
		console.log('Connected to EPYW.db');
	}
});


app.get('/all_markers', (request,response) => {
	const query_str = "SELECT ID_PLACE, LATITUDE, LONGITUD FROM PLACE_IDS WHERE LATITUDE;"
	db.all(query_str, (err, rows) => {
		if (err) {
            //console.log('I got an error');
			response.end();
			return;
		} else {
            console.log(rows);
			return response.json({ data: rows });
		}
	});
});

app.get('/all_works', (request,response) => {
	const query_str = "SELECT * FROM PRINTS;"
	db.all(query_str, (err, rows) => {
		if (err) {
            //console.log('I got an error');
			response.end();
			return;
		} else {
            console.log(rows);
			return response.json({ data: rows });
		}
	});
});

app.get('/who_list', (request,response) => {
	const query_str = "SELECT ID_WHO, NAME FROM WHO_IDS;"
	db.all(query_str, (err, rows) => {
		if (err) {
            //console.log('I got an error');
			response.end();
			return;
		} else {
            console.log(rows);
			return response.json({ data: rows });
		}
	});
});

app.get('/year_list', (request,response) => {
	const query_str = "SELECT ID_YEAR, YEAR FROM YEAR_IDS ORDER BY YEAR;"
	db.all(query_str, (err, rows) => {
		if (err) {
            //console.log('I got an error');
			response.end();
			return;
		} else {
            console.log(rows);
			return response.json({ data: rows });
		}
	});
});

app.post('/results', (request, response) => {
	var params = request.body;
	var who = params.who.toString();
	var when = params.when.toString();
	
	var ID_PLACE = params.id_place.toString();
	if (who == 'all') {
		// ID_WHO *
		if (when == 'all') {
			//console.log('here');
			var key_list = `SELECT Key FROM WHERE_prints WHERE ID_PLACE=${ID_PLACE};`
			db.all(key_list, (klist_err, klist_rows) => {
				if (klist_err) {
					console.log(klist_err.message);
					response.end();
				}
				return response.json({data : klist_rows});

				
			});
			

		} else {
			console.log('here');
			var ID_WHEN = when;
			var key_list = `SELECT WHERE_prints.Key FROM WHERE_prints JOIN WHEN_prints ON (WHERE_prints.Key=WHEN_prints.Key) WHERE WHERE_prints.ID_PLACE=${ID_PLACE} AND WHEN_prints.ID_YEAR=${ID_WHEN};`
			db.all(key_list, (klist_err, klist_rows) => {
				if (klist_err) {
					console.log(klist_err.message);
					response.end();
				}
				return response.json({data : klist_rows});
			});

		}

	} else {
		var ID_WHO = who;
		if (when == 'all') {
			var key_list = `SELECT WHERE_prints.Key FROM WHERE_prints JOIN WHO ON (WHERE_prints.Key=WHO.Key) WHERE WHERE_prints.ID_PLACE=${ID_PLACE} AND WHO.ID_WHO=${ID_WHO};`
			db.all(key_list, (klist_err, klist_rows) => {
				if (klist_err) {
					console.log(klist_err.message);
					response.end();
				}
				return response.json({data : klist_rows});
			});


		} else {
			var ID_WHEN = when;
			var key_list = `SELECT WHERE_prints.Key FROM WHERE_prints JOIN WHO ON (WHERE_prints.Key=WHO.Key) JOIN WHEN_prints ON (WHERE_prints.Key=WHEN_prints.Key) WHERE WHERE_prints.ID_PLACE=${ID_PLACE} AND WHO.ID_WHO=${ID_WHO} AND WHEN_prints.ID_YEAR=${ID_WHEN};`
			db.all(key_list, (klist_err, klist_rows) => {
				if (klist_err) {
					console.log(klist_err.message);
					response.end();
				}
				return response.json({data : klist_rows});
			});

		}
	}
	//console.log(who);
	//console.log(when);
});