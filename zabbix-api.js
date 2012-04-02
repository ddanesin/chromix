// main
function main(method){
    var auth = getAuth("Admin", "zabbix");
    var rpcid = auth.id + 1;
    var filter = new Object(); // ���g�p�B
    var params = new Object();
        params.output = "extend";
        params.limit = 100;
        params.filter = filter;	
    
    getZabbixData(rpcid, auth.result, method, params);
}

//API Access Authentication
function getAuth(user, password) {
    var params = {"user":user, "password":password};
    var authRequest = new Object();
        authRequest.params = params;
        authRequest.auth = null;
        authRequest.jsonrpc = '2.0';
        authRequest.id = 0;
        authRequest.method = 'user.authenticate';
    var authJsonRequest = JSON.stringify(authRequest);
    var authResult = new Object();
    $.ajax({
        url: 'http://localhost/zabbix/api_jsonrpc.php',
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
function getZabbixData(rpcid, authid, method, params) { // "params"��JSON�`���̕����񃊃e������JSON�ɕϊ��\�ȃI�u�W�F�N�g
    var dataRequest = new Object();
        dataRequest.params = params;
        dataRequest.auth = authid;
        dataRequest.jsonrpc = '2.0';
        dataRequest.id = rpcid;
        dataRequest.method = method;
    var dataJsonRequest = JSON.stringify(dataRequest);
    $.ajax({
        type: 'POST',
        url: 'http://localhost/zabbix/api_jsonrpc.php',
        contentType: 'application/json-rpc',
        dataType: 'json',
        processData: false,
        data: dataJsonRequest,
        success: function(response){
            showResult(response);
        },
        error: function(response){ alert("failed"); },
    });
    //return dataResult;
}

// ���o�����f�[�^���e�[�u���Ƃ��ďo��
function showResult(response){
    var strTable = "";
    strTable += "<table>";
    for(var index in response.result) {
        strTable += "<tr><th>";
        strTable += "host"; // "host"�����e�[�u���̃^�C�g���s�ɁB
        strTable += "</th><th>";
        strTable += response.result[index].host;
        strTable += "</th></tr>";
        for ( var itemname in response.result[index]){
            if (itemname == "host") { continue };
            strTable += "<tr><td>";
            strTable += itemname;
            strTable += "</td><td>";
            if (typeof(response.result[index][itemname]) == "object"){
                strTable += JSON.stringify(response.result[index][itemname]);
            } else {
                strTable += response.result[index][itemname];
            }
            strTable += "</td></tr>";
        }
    }
    strTable += "</table><br>";
    document.getElementById("datatable").innerHTML = strTable;
}
