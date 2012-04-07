function getTab(){
	var tab_str = "<ul>"; 
	var count = 0;
	for( var key in localStorage ){
		if( sessionStorage.getItem("selected") == key ){
			tab_str += "<li id=tab" + count + " class=selected_tab >" + key + "</li>";
		}else{
			tab_str += "<li id=tab" + count + " class=tab >" + key + "</li>";
		}
		count++;
	}
	tab_str += "</ul>"
	$("#tab").html(tab_str);
	$("li.tab").click(function(){
		sessionStorage.setItem("selected",$(this).text());
		selectedTabView(sessionStorage.getItem("selected"));
	});
}

function selectedTabView(selected_tab){
	for( var key in localStorage ){
		var token = JSON.parse(localStorage.getItem(key)).token;
		var checktime = JSON.parse(localStorage.getItem(key)).checktime;
		if( sessionStorage.getItem("selected") == null ){
			sessionStorage.setItem("selected",key);
			getTriggerList(key,token,checktime);
			getTab();
		}else if( sessionStorage.getItem("selected") == key ){    
			getTriggerList(key,token,checktime);
			getTab();
		}
	}
}


function getTriggerList(url,token,checktime){
	var rpcid = 1;
	var filter = new Object();
		filter.status = 0;
		filter.value = 1;
	var params = new Object();
		params.output = "extend";
		params.expandData = 1;
		params.limit = 100;
		params.filter = filter;
	getZabbixData(rpcid, url, token, "trigger.get", params);
}

function unixtimeToDate(ut, TZ) {
	var tD = new Date( ut * 1000 );
	tD.setTime( tD.getTime() + (60*60*1000 * TZ) );
	var yy = tD.getYear();
	var mm = tD.getMonth() + 1;
	var dd = tD.getDate();
	if (yy < 2000) { yy += 1900; }
	if (mm < 10) { mm = "0" + mm; }
	if (dd < 10) { dd = "0" + dd; }
	var time = yy + "/" + mm + "/" + dd + " " + tD.getHours() + ":" + tD.getMinutes() + ":" + tD.getSeconds();
	return time;
}

function getTriggerCount(url, token, ckecktime) { // "params"��JSON�`���̕����񃊃e������JSON�ɕϊ��\�ȃI�u�W�F�N�g
	var rpcid = 1;
	var filter = new Object();
	    filter.status = 0;
	    filter.value = 1;
	var params = new Object();
	    params.output = "extend";
	    params.limit = 100;
	    params.filter = filter;
	getZabbixData(rpcid, url, token, "trigger.get", params);
	var dataRequest = new Object();
	dataRequest.params = params;
	dataRequest.auth = token;
	dataRequest.jsonrpc = '2.0';
	dataRequest.id = rpcid;
	dataRequest.method = "trigger.get";
	var dataJsonRequest = JSON.stringify(dataRequest);
	var dataNum = 0;
	var api_url = "http://" + url + "/api_jsonrpc.php";
	$.ajax({
		type: 'POST',
		url: api_url,
		contentType: 'application/json-rpc',
		dataType: 'json',
		processData: false,
		async: false,
		data: dataJsonRequest,
		success: function(response){
			console.log(response);
			dataNum = response.result.length;
		},
		error: function(response){ alert("failed"); },
	});
	console.log(dataNum);
	return(dataNum);
}
//API Access Authentication
function getAuth(url, user, password) {
    var params = {"user":user, "password":password};
    var authRequest = new Object();
        authRequest.params = params;
        authRequest.auth = null;
        authRequest.jsonrpc = '2.0';
        authRequest.id = 0;
        authRequest.method = 'user.authenticate';
    var authJsonRequest = JSON.stringify(authRequest);
    var authResult = new Object();
    var api_url = "http://" + url + "/api_jsonrpc.php";
    $.ajax({
        url: api_url,
        contentType: 'application/json-rpc',
        dataType: 'json',
        type: 'POST',
        processData: false,
        async: false, // �F�؂��I���Ȃ��Ǝ��̏������ł��Ȃ��̂ŁA�����͓����ʐM�ɁB
        data: authJsonRequest,
        success: function(response){
            authResult = response;
        },
        error: function(){ alert("failed"); },
    });
    return(authResult); // �F�،��ʂ�Object�Ƃ��ĕԂ���"auth.id", "auth.result"�Ŏ��o���B
}

// Access Zabbix API and Get Data
function getZabbixData(rpcid, url, authid, method, params) { // "params"��JSON�`���̕����񃊃e������JSON�ɕϊ��\�ȃI�u�W�F�N�g
	var dataRequest = new Object();
	dataRequest.params = params;
	dataRequest.auth = authid;
	dataRequest.jsonrpc = '2.0';
	dataRequest.id = rpcid;
	dataRequest.method = method;
	var dataJsonRequest = JSON.stringify(dataRequest);
	var api_url = "http://" + url + "/api_jsonrpc.php";
	$.ajax({
		type: 'POST',
		url: api_url,
		contentType: 'application/json-rpc',
		dataType: 'json',
		processData: false,
		data: dataJsonRequest,
		success: function(response){
			showResult(response,url);
		},
		error: function(response){ alert("failed"); },
	});
}

function Logout(key){
	localStorage.removeItem(key);
	location.reload();
}
// ���o�����f�[�^���e�[�u���Ƃ��ďo��
function showResult(response,url){
	var strTable = "";
	strTable += "<table>";
	if( response.result == "" ){
		strTable += "No Event!";
	}else{
		strTable += "<a href=# onclick=Logout('"+url+"')>Logout</a>";
		strTable += "<tr><th>Description</th><th>Time</th><th>Host</th>";
		for(var index in response.result) {
			strTable += "<tr>";
			for ( var itemname in response.result[index]){
				if ( itemname == "hostname"){
					var hostname = response.result[index][itemname];
				}else if( itemname == "description") {
					var description = response.result[index][itemname];
				}else if( itemname == "lastchange"){
					var TZ = +0;
					var unixtime = response.result[index][itemname];
					var time =  unixtimeToDate(parseInt(response.result[index][itemname]),TZ);
				}else if( itemname == "triggerid"){
					var pageurl = "http://" + url + "/events.php?triggerid=" + response.result[index][itemname];
				};
			}
			strTable += "<td><a href=" + pageurl + " target=_blank >" + description + "</a></td><td>" + time + "</td><td>" + hostname + "</td>";
			strTable += "</tr>";
		}
	}
	strTable += "</table><br>";
	//document.getElementById("datatable").innerHTML = strTable;
	$("#datatable").fadeOut("normal",function(){
		$("#datatable").html(strTable);
		$("#datatable").fadeIn();
	});
	
}
