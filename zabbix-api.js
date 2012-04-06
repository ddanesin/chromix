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
        //filter.value = 1;
    var params = new Object();
        params.output = "extend";
        params.expandData = 1;
        params.limit = 100;
        params.filter = filter;
   // $("#server_url").text(url);
    getZabbixData(rpcid, url, token, "trigger.get", params);
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
    //return dataResult;
}


// ���o�����f�[�^���e�[�u���Ƃ��ďo��
function showResult(response,url){
    var strTable = "";
    strTable += "<table>";
    for(var index in response.result) {
        strTable += "<tr><td>";
        for ( var itemname in response.result[index]){
            if (itemname == "hostname" || itemname == "description") {
               strTable += response.result[index][itemname];
               strTable += "</td><td>";
            };
             
        }
        strTable += "</td></tr>";
    }
    strTable += "</table><br>";
    //document.getElementById("datatable").innerHTML = strTable;
	$("#datatable").fadeOut("normal",function(){
		$("#datatable").html(strTable);
		$("#datatable").fadeIn();
	});
	
}
