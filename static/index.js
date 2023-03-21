const EPYWmap = L.map('EPYWmap').setView([33.513056, 36.291944], 4);
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tiles = L.tileLayer(tileURL, { attribution });
tiles.addTo(EPYWmap);
L.svg().addTo(EPYWmap);



function d3circles(pointsdata) {
    
    console.log(pointsdata.length);
    //console.log(EPYWmap);
    d3.select("#EPYWmap")
        .select("svg")
        .selectAll('*')
        .remove()
    
    const data = d3.select("#EPYWmap")
        .select("svg")
        .selectAll("myCircles")
        .data(pointsdata)
        .enter()
    const circles = data.append("circle")
            .attr("cx", function(d){ return EPYWmap.latLngToLayerPoint([d.LATITUDE, d.LONGITUD]).x })
            .attr("cy", function(d){ return EPYWmap.latLngToLayerPoint([d.LATITUDE, d.LONGITUD]).y })
            .attr("r", function(d){ return d.radius*EPYWmap._zoom})
            .style("fill", "red")
            .attr("stroke", "red")
            .attr("stroke-width", 3)
            .attr("fill-opacity", .4)
            //.on("click", function(d) {return printlist(d)});
    
    console.log(EPYWmap._zoom);
    //circles.on("click", printlist(d));
    EPYWmap.on("moveend", update);
}
function printlist(d) {
    console.log('prints list required');
    var prints_list = document.getElementById('prints-list');
    var prints_keys = d.key_list;
    prints_list.innerHTML()='';
    Array.from(prints_keys).forEach((pkey)=>{
        var print_data = prints_info[pkey];
        var print_li = document.createElement('li');
        var print_li_txt = document.createTextNode(`Author:${print_data.author}, Title:${print_data.title}, Editor:${print_data.editor}, Publisher:${print_data.publisher}.`)
        print_li.appendChild(print_li_txt);
        prints_list.appendChild(print_li);
    });
}
function update() {
    d3.selectAll("circle")
        .attr("cx", function(d){ return EPYWmap.latLngToLayerPoint([d.LATITUDE, d.LONGITUD]).x })
        .attr("cy", function(d){ return EPYWmap.latLngToLayerPoint([d.LATITUDE, d.LONGITUD]).y })
        .attr("r", function(d){ return d.radius*EPYWmap._zoom})
}


async function CreateSelectField(id_select, id_datalist, id_span, ID, STR, query_url){
    var button_res = await fetch(query_url);
    var button_data = await button_res.json();
    button_data = button_data.data;
    //var parent_div = document.getElementById(parent_div_id);
    var datalist = document.createElement('datalist');
        datalist.setAttribute('id', id_datalist);

        
    if (id_select == 'someone_select') {
        var select = document.createElement('input');
        select.setAttribute('type', 'text');
        select.setAttribute('id', id_select);
        select.setAttribute('placeholder', "Type the name you're looking for");
        select.setAttribute('list', id_datalist );
        
        var span = document.createElement('span');
        span.setAttribute('id', id_span);
        span.setAttribute('class', 'param');
        Array.from(button_data).forEach((item) => {
            if (item[STR]) {
                var item_opt = document.createElement('option');
                var item_txt = document.createTextNode(item[STR]);
                item_opt.appendChild(item_txt);
                
                item_opt.setAttribute('value', item[ID]);
                datalist.appendChild(item_opt);
            }
        });
        return [select, datalist, span];
        
    } else {
        var select = document.createElement('input');
        select.setAttribute('type', 'range');
        select.setAttribute('id', id_select);
        select.setAttribute('min', 1);
        select.setAttribute('list', id_datalist );
        var span = document.createElement('span');
        span.setAttribute('id', id_span);
        span.setAttribute('class', 'param');
        var span_text = document.createTextNode('Slide to one particular year.');
        span.appendChild(span_text);
        var yearID_conv = {};
        var n_value = 1;
        Array.from(button_data).forEach((item) => {
            if (item[STR]) {
                var item_opt = document.createElement('option');
                var item_txt = document.createTextNode(item[STR].toString());
                item_opt.appendChild(item_txt);
                item_opt.setAttribute('value', n_value);
                yearID_conv[n_value] = item[ID];
                //item_opt.setAttribute('value', item[ID]);
                datalist.appendChild(item_opt);
                n_value+=1;
            }    
        });
        select.setAttribute('max', n_value);
        select.setAttribute('step', 1);
        return [select, datalist, span, yearID_conv];
    }
    
    //parent_div.append(select);
    //parent_div.appendChild(lemma_list);
    
}
async function MakeNameReactive(id_select, id_datalist, id_span) {
    var select = document.getElementById(id_select);
    var datalist = document.getElementById(id_datalist);
    var span = document.getElementById(id_span);
    select.addEventListener('change', (event) => {
        //console.log(`You are changing the ${id_select} button!`);
        //console.log(datalist);
        var selected_value = select.value;
        console.log(selected_value);
        Array.from(datalist.getElementsByTagName('option')).forEach((opt) => {
            //console.log(opt.value);
            if (opt.value == selected_value) {
                span.textContent = opt.text;
            }   
        });  
    });
}
async function MakeDateReactive(id_select, id_datalist, id_span, yearID_conv) {
    var select = document.getElementById(id_select);
    var datalist = document.getElementById(id_datalist);
    var span = document.getElementById(id_span);
    select.addEventListener('change', (event) => {
        console.log(`You are changing the ${id_select} button!`);
        //console.log(datalist);
        var selected_value = select.value;
        Array.from(datalist.getElementsByTagName('option')).forEach((opt) => {
            if (opt.value == selected_value) {
                span.textContent = opt.text;
                //console.log(opt);
            }   
        }); 
        year_ID = yearID_conv[selected_value];
        console.log(`You have selected year_ID ${year_ID}`);
        var everyone = document.getElementById('everyone');
        var someone = document.getElementById('someone');
        if (everyone.checked == false && someone.checked==false) {
            alert('You need to set the Author/Editor parameter and then clik on the Visualization button.')
        } else if (everyone.checked == true) {

            var params = {'who': 'all', 'when': year_ID};
            console.log(params);
            MakeResultsAppear(params);
        } else {
            var who = document.getElementById('someone_select');
            console.log(who);
            var params = {'who': who.value, 'when': year_ID};
            console.log(params);
            MakeResultsAppear(params);
        }

    });
}
async function AddSelectField(button_id, query_url, ID, STR, parent_div_id){
    console.log('heyah');
    //var button_res = await fetch(query_url);
    //var button_data = await button_res.json();
    //button_data = button_data.data;
    var button = document.getElementById(button_id);
    console.log(button.checked);
    var id_select = button_id + '_select';
    console.log(select);
    var id_datalist = button_id + '_list';
    var id_span = button_id + '_span'
    var select = document.getElementById(id_select);
    var datalist = document.getElementById(id_datalist);
    var span = document.getElementById(id_span);
    
    if (button.checked == true && select==null) {
        console.log('heyah');
        var new_elements = await CreateSelectField(id_select, id_datalist, id_span, ID, STR, query_url);
        var parent_div = document.getElementById(parent_div_id);
        console.log(parent_div_id);
        parent_div.append(new_elements[0]);
        parent_div.append(new_elements[1]);
        parent_div.append(new_elements[2]);
        if (parent_div_id == 'who_modality') {
            MakeNameReactive(id_select, id_datalist, id_span);
        } else {
            MakeDateReactive(id_select, id_datalist, id_span, new_elements[3]);
        }
        
        
    } else if (button.checked == false ) {
        console.log('I should be here');
        select.remove();
        datalist.remove();
        span.remove();
    }
    
};


async function CheckUncheckButtons(button_id1, button_id2, query_url, ID, STR, parent_div_id) {
	var button1 = document.getElementById(button_id1);
	var button2 = document.getElementById(button_id2);
    //console.log(button1);
    //console.log(button2);
	button1.addEventListener('change', (event) => {
		if (button1.checked == true) {
			if (button2.checked == true) {
				button2.checked = false;
                AddSelectField(button_id2, query_url, ID, STR, parent_div_id);
			} 
			button1.checked = true;
		} 
	});
	button2.addEventListener('change', (event) => {
		if (button2.checked == true) {
			if (button2.checked == true) {
				button1.checked = false;
			}
			button2.checked = true;
            AddSelectField(button_id2, query_url, ID, STR, parent_div_id);
		} 
		
	});
    

}
async function GetKeyList(params) {
    //console.log(params);
    var keylist_url = 'results/';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
        body: JSON.stringify(params)
    };
    const keylist_res = await fetch(keylist_url, options);
    //console.log(keylist_res);
	const keylist = await keylist_res.json();
    return keylist;
}

async function MakeResultsAppear(params) {
    //console.log(params);
    var markers_data = new Array();
    const markers_url = 'all_markers/';
    const response = await fetch(markers_url);
    //console.log(response);
    var markers = await response.json();
    markers = markers.data;
    //d3circles(markers);
    //console.log(markers);
    markers_len = markers.length;
    n=1;
    Array.from(markers).forEach(async (m) => {
        var mark_id = m.ID_PLACE;
        //var mark_lat = m.LATITUDE;
        //var mark_lon = m.LONGITUD;
        //console.log(mark_id);
        params['id_place'] = mark_id;
        var keylist = await GetKeyList(params);
        keylist = keylist.data;
        var klist = new Array();
        Array.from(keylist).forEach((k) => {
            klist.push(k.Key);
        });

        var data_m = {'LATITUDE': m.LATITUDE, 'LONGITUD': m.LONGITUD, 'radius': klist.length, 'key_list' : klist};
        //var data_m = {'LATITUDE': m.LATITUDE, 'LONGITUD': m.LONGITUD, 'radius': klist.length};
        
        markers_data.push(data_m);
        if (n==markers_len) {
            d3circles(markers_data);
        } else {
            n+=1;
        }
        //console.log(keylist);
    });
    //console.log(markers_data);
    


    /*Array.from(markers).forEach((m)=> {
        console.log(m);
        var mark_id = m.ID_PLACE;
        var mark_coord = [m.LATITUDE, m.LONGITUD];
        console.log(mark_id);
        params['id_place'] = mark_id;
    });*/
        
        //var keylist = await GetKeyList(params);
        //console.log(keylist);

}
function ButtonSubmit() {
    
    button_visualization = document.getElementById("QuerySubmitButton");
    button_visualization.addEventListener("click", (event) => {
        console.log('I got clicked!');
        var who_everyone = document.getElementById("everyone");
        var who_someone = document.getElementById("someone");
        var everyone_val = who_everyone.checked;
        var someone_val = who_someone.checked;
        if (everyone_val == false && someone_val==false) {
            alert('You need to check one or the other box to set the Author/Editor parameter.')
        } else if (everyone_val) {
            var whenever = document.getElementById('whenever');
            var someyear = document.getElementById('someyear');
            var whenever_val = whenever.checked;
            var someyear_val = someyear.checked;
            if (whenever_val == false && everyone_val == false) {
                alert('You need to check one or the other box to set the date parameter.')
            } else if (whenever_val == true) {
                var params = {'who': 'all', 'when': 'all'};
                console.log(params);
                MakeResultsAppear(params);
            } else {
                var params = {'who': 'all', 'when': year_ID};
                console.log(params);
                MakeResultsAppear(params);
            }
            //if whenever ==true else...
            //do someting with data (il va falloir passer la fonction en async je pense)
        } else {
            var who = document.getElementById('someone_select');
            var whenever = document.getElementById('whenever');
            var someyear = document.getElementById('someyear');
            var whenever_val = whenever.checked;
            var someyear_val = someyear.checked;
            if (whenever_val == false && everyone_val == false) {
                alert('You need to check one or the other box to set the date parameter.')
            } else if (whenever_val == true) {
                var params = {'who': who.value, 'when': 'all'};
                console.log(params);
                MakeResultsAppear(params);
            } else {
                var params = {'who': who.value, 'when': year_ID};
                console.log(params);
                MakeResultsAppear(params);
            }

        }
    });

}
async function setup() {
    
    //AddSelectField("someone", "who_list/", "ID_WHO", "NAME", "who_setting");
    const all_works_url = 'all_works/';
    const works_res = await fetch(all_works_url);

    
    var all_works = await works_res.json();
    all_works = all_works.data;
    Array.from(all_works).forEach((w)=>{
        prints_info[w.Key] = {'author': w.Author, 'title': w.Title, 'editor': w.Editor, 'publisher': w.Publisher};
    });
    console.log(prints_info);
    CheckUncheckButtons("everyone", "someone", "who_list/", "ID_WHO", "NAME", "who_modality");
    CheckUncheckButtons("whenever", "someyear", "year_list/", "ID_YEAR", "YEAR", "when_modality");
    ButtonSubmit();
   /* var who = new Set();
    Array.from(all_works).forEach(w => {
        if (w.Editor) {
            who.add(w.Editor);
        } else if (w.A) {
            who.add(w.Author)
        }
        
    });*/
    /*
    const markers_url = 'all_markers/';
    const response = await fetch(markers_url);
    console.log(response);
    var markers = await response.json();
    
    d3circles(markers);*/
    //console.log(markers);

    

    
    
}
var prints_info = {};
var year_ID;
setup()