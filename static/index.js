const EPYWmap = L.map('EPYWmap').setView([33.513056, 36.291944], 4);
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tiles = L.tileLayer(tileURL, { attribution });
tiles.addTo(EPYWmap);
L.svg().addTo(EPYWmap);



function d3circles(pointsdata, dic_markers,params) {
    points_dic = {};
    Array.from(pointsdata).forEach(pdata => {
        points_dic[pdata.id_place] = [pdata.LATITUDE, pdata.LONGITUD];

    });

    d3.select("#EPYWmap")
        .select("svg")
        .selectAll('*')
        .remove()
    
    
    
    d3.select("#EPYWmap")
        .select("svg")
        .selectAll("myCircles")
        .data(pointsdata)
        .enter()
        .append("g")
        .append("circle")
            .attr("id", function(d){ return d.id_place})
            .attr("cx", function(d){ return EPYWmap.latLngToLayerPoint([d.LATITUDE, d.LONGITUD]).x })
            .attr("cy", function(d){ return EPYWmap.latLngToLayerPoint([d.LATITUDE, d.LONGITUD]).y })
            .attr("r", function(d){ return d.radius*EPYWmap._zoom})
            .style("fill", "red")
            .style("cursor", "pointer")
            .attr("stroke", "red")
            .attr("stroke-width", 3)
            .attr("fill-opacity", .5)
    
    //console.log(EPYWmap._zoom);
    
    EPYWmap.on("moveend", update);
    d3.selectAll('circle')
      .attr('pointer-events', "visiblePainted")
      .each(function(d){
        var place_id = d.id_place;
        d3.select(this)
          .on('click', (event)=>{
            //console.log(d3.select(this).attr('cx'));
            d3.selectAll('circle').style("fill", "red");
            d3.selectAll('circle').attr("stroke", "red");
            //d3.select(this).style("fill", "#f1f132");
            d3.select(this).attr("stroke", "blue");
            
            //change class div main
            var div_main = document.getElementById("main");
            var main_class = div_main.getAttribute("class");
            var map = document.getElementById("EPYWmap");
            var map_class = map.getAttribute("class")
            //map.setAttribute("class", "map-onleft");
            //console.log(main_class);
            if (main_class=="only_map"){
                div_main.setAttribute("class", "map_parts");
                /*console.log(map.getAttribute("class"));
                if (!map_class.startsWith("map-onleft")){
                    map.setAttribute("class", "map-onleft "+ map_class);
                    EPYWmap.invalidateSize();
                    
                }
                console.log(map.getAttribute("class"));*/
            }
            if (!map_class.startsWith("map-onleft")){
                map.setAttribute("class", "map-onleft "+ map_class);
                //EPYWmap.invalidateSize();
                
            }
            EPYWmap.invalidateSize();
            //
            //create div prints if not exists
            if (!document.getElementById("prints")){
                var prints_div = document.createElement("div");
                prints_div.setAttribute("id", "prints");
                prints_div.setAttribute("class", "data_visualization");
                var print_num = document.createElement("h3");
                var prints_list = document.createElement("ol");
                prints_list.setAttribute("id", "prints-list");
                prints_div.appendChild(print_num);
                prints_div.appendChild(prints_list);
                div_main.appendChild(prints_div);

            }
            //EPYWmap.panTo(d3.select(this).attr('cx'), d3.select(this).attr("cy"));
            var index = d3.select(this).attr("id");
            /*index = parseInt(index) - 1;
            console.log(index);*/
            var point_data = points_dic[index];
            //console.log(point_data);
            var current_zoom = EPYWmap._zoom;
            
            EPYWmap.setView(point_data, current_zoom);
            
            var prints_keys = dic_markers[place_id];

            var prints_div = document.getElementById("prints");
            var print_num = prints_div.getElementsByTagName('h3')[0];
            var prints_list = document.getElementById('prints-list');
            prints_list.innerHTML= '';
            print_num.innerText = `${prints_keys.length.toString()} print(s) registered:`;
            
            Array.from(prints_keys).forEach((pkey)=>{
                var print_data = prints_info[pkey];
                var print_li = document.createElement('li');
                print_li.innerHTML = `<span>Title: ${print_data.title}</span><br/><span>Author: ${print_data.author}</span>, <span>Editor: ${print_data.editor}<span><br/> <span>Publisher: ${print_data.publisher}</span>`
                //var print_li_txt = document.createTextNode(`Title: ${print_data.title}\n Author: ${print_data.author}, Editor: ${print_data.editor},\n Publisher: ${print_data.publisher}.`)
                //print_li.appendChild(print_li_txt);
                prints_list.appendChild(print_li);
            });
            if (document.getElementById("AnalyticsButton")) {
                if (document.getElementById("placedatapies")){
                    document.getElementById("placedatapies").remove();
                }
                
                document.getElementById("AnalyticsButton").remove();
            }

            if (params.who=="all" && params.when == "all") {
                
                var analytics_button = document.createElement("button");
                analytics_button.setAttribute("id", "AnalyticsButton");
                var analyticsbutton_txt = document.createTextNode("See Place Data Analytics");
                analytics_button.appendChild(analyticsbutton_txt);
                prints_div.appendChild(analytics_button);
                AnalyticsButtonBehavior(prints_keys, params, 'placedatapie');
            }
            
            
          })
          .on('mouseenter', (event)=>{
            console.log('mouse is over me');
            d3.select(this).style("fill", "blue");
            
          })
          .on('mouseleave', (event)=>{
            if (d3.select(this).attr('stroke') == 'red') {
                d3.select(this).style("fill", "red");
            }
          });
        

      });
        
}
function angle(d) {
    var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
    return a > 90 ? a - 180 : a;
}
function MakingPie(placedata, params, pieclass){
    var prints_div = document.getElementById("prints");
    var pies_div = document.createElement("div");
    pies_div.setAttribute("id", pieclass+"s");
    prints_div.appendChild(pies_div);
    pies_div = document.getElementById(pieclass+"s");
    for (const key in placedata) {
        
        var pie_id = key + "_" + pieclass;
        var pie = document.createElement("div");
        pie.setAttribute("class", pieclass);
        pie.setAttribute("id", pie_id);
        var pie_label = document.createElement("label");
        var pie_label_txt = "<br/>By "+ key;

        pie_label.innerHTML = pie_label_txt;
        pie_label.setAttribute("for", pie_id);
        pie_label.setAttribute("class", "pie-label");

        pies_div.appendChild(pie_label);
        pies_div.appendChild(pie);
        

        pie = document.getElementById(pie_id);
        var width = pie.offsetWidth;
        var height = 600;
        var margin = 50;

        var radius = Math.min(width, height) / 2 - margin;

        var svg = d3.select("#"+pie_id)
                    .append("svg")
                      .attr("width", width)
                      .attr("height", height)
                    .append("g")
                      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        console.log(svg);

        var data = placedata[key];

        var sum = 0;
        Array.from(data).forEach(dt=>{
            sum+=data[dt];
        });
        console.log(data);
        var color = d3.scaleOrdinal()
          .domain(data)
          .range(d3.schemeCategory10);
        
        var pie_obj = d3.pie()
          .value(function(d) {return d.value; });

        var data_ready = pie_obj(d3.entries(data));

        var arcGenerator = d3.arc()
            .innerRadius(radius/10)
            .outerRadius(radius)
        
        svg
            .selectAll('mySlices')
            .data(data_ready)
            .enter()
            .append('path')
              .attr('d', arcGenerator)
              .attr('fill', function(d){ return(color(d.data.key)); })
              .attr("stroke", "black")
              .style("stroke-width", "2px")
              .style("opacity", 0.7)
              
        
        svg
            .selectAll('mySlices')
            .data(data_ready)
            .enter()
            .append('text')
            .text(function(d){ return d.data.key + ' : ' + d.data.value.toString()})
            .attr("transform", function(d) {
                d.outerRadius = radius*1.5;
                d.innerRadius = radius/2;
                return "translate(" + arcGenerator.centroid(d) + ")rotate(" + angle(d) + ")";})
            .style("text-anchor", "middle")
            .style("font-size", 17)
        //console.log(data);
        console.log(svg);
    }
}
async function GetPlaceData(prints_keys, params){
    var new_params = {'prints_IDs': prints_keys, 'who': params.who, 'when': params.when};
    console.log(new_params);
    var analytics_url = 'analytics/';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
        body: JSON.stringify(new_params)
    };
    const placedata_res = await fetch(analytics_url, options);
    //console.log(placedata_res);
	const placedata = await placedata_res.json();
    //console.log(placedata);
    return placedata.data; 
    
}
function AnalyticsButtonBehavior(prints_keys, params, pieclass) {
    var anabutton = document.getElementById("AnalyticsButton");
    console.log(prints_keys);
    anabutton.addEventListener("click", async (event)=>{
        var dataplace = await GetPlaceData(prints_keys, params);
        //console.log(dataplace);
        var buttontxt = anabutton.textContent;
        if (buttontxt=="See Place Data Analytics") {
            /*Array.from(prints_keys).forEach(pkey=>{
                console.log(prints_info[pkey]);
            });*/
            MakingPie(dataplace, params, pieclass);
            anabutton.textContent= "Hide Analytics";

        } else {
            document.getElementById(pieclass+"s").remove();
            anabutton.textContent= "See Place Data Analytics";
        }
        console.log(buttontxt);
    });
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
    var div_main = document.getElementById("main");
    var main_class = div_main.getAttribute("class");
    var map = document.getElementById("EPYWmap");
    var map_class = map.getAttribute("class");
    console.log(main_class);
    if (main_class=="map_parts"){
        console.log("cleaning up!");
        while (div_main.lastElementChild.getAttribute("id")!="EPYWmap"){
            div_main.removeChild(div_main.lastElementChild);
        }

        map.setAttribute("class", map_class.slice(11));
        div_main.setAttribute("class", "only_map");
        EPYWmap.invalidateSize();
        EPYWmap.setView([33.513056, 36.291944], 4);
        console.log(div_main);
    }
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
    dic_markers = {};
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

        var data_m = {'id_place': 'place_' + mark_id.toString(), 'LATITUDE': m.LATITUDE, 'LONGITUD': m.LONGITUD, 'radius': klist.length, 'key_list' : klist};
        //var data_m = {'LATITUDE': m.LATITUDE, 'LONGITUD': m.LONGITUD, 'radius': klist.length};
        
        markers_data.push(data_m);
        dic_markers[data_m.id_place]=klist;
        if (n==markers_len) {
            d3circles(markers_data, dic_markers, params);
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
            if (whenever_val == false && someyear_val == false) {
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
            if (whenever_val == false && someyear_val == false) {
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