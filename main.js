
var express=require('express');
var session = require('express-session');	/*세션을 사용하기 위해*/
var app=express();
var LocalStrategy = require('passport-local').Strategy;
var bkfd2Password = require('pbkdf2-password');
var hasher = bkfd2Password();
var mysql=require('mysql');
var bodyParser=require('body-parser');
var conn = mysql.createConnection({
	host : '192.168.0.50',
	user : 'root',
	password : 'gri1234',
	database : 'unidata'
});


var jayson =  require('jayson');
/*routes 파일의 index.js를 사용할 수 있는 코드 - 현재는 보류*/
/*var index = require('./routes/index');*/

/*var index = require('/.view');*/
conn.connect();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
/*app.use('/',index);*/
app.set('views','./view');
app.set('view engine','ejs');

app.use(express.static(__dirname +'/public'));	/*to make .css file well applied*/

var pool = mysql.createPool({
	connectionLimit: 3,
	host: '192.168.0.50',
	port: 3000,
	user: 'root',
	password: 'gri1234',
	database: 'unidata'
});


/*홈페이지 : 등록 선택 창*/
app.get('/register',function(req,res){
		res.render('register');
});


app.get('/register/center',function(req,res){
	res.render('register_center');
});


/*기관등록 창*/
app.post('/register/center', function(req,res){
	var data={
	"기관ID": req.body.id,
	"PASSWORD": req.body.password, 
	"기관명": req.body.centername, 
	"기관이름": req.body.name, 
	"주소": req.body.address, 
	"기관담당자": req.body.manager, 
	"이메일": req.body.email, 
	"핸드폰번호": req.body.phone
	};

	console.log(data);

	var sql='INSERT INTO 기관 SET ?';
	conn.query(sql,data,function(err,rows,fields){ 
		if(err){
			console.log("err : "+err);
			res.status(500).send('Internal Server Error222');
		} else { 
			console.log("register success!");
			res.render('success_center');
		}
	});
});

/*success페이지 이후 list또는 register로 rendering*/	


/*기관 : mysql의 목록 출력*/
app.get('/main',function(req,res){
	var sql='SELECT * FROM 기관';
	conn.query(sql,function(err,rows,fields){
		if(err) console.log("err :"+err);
		res.render('CenterList',{rows:rows});	
	});
});




/*학과 등록 창 - 기관 선택 select로 불러오기 */
app.get('/register/dept', function(req,res){
	var sql='SELECT 기관ID, 기관이름 FROM 기관';
	conn.query(sql,function(err,rows,fields){
		if(err) console.log(err);
		res.render('register_dept',{rows:rows})
		console.log('success rows')
	});
});


/*기관(FK) 넘겨주고(req.params.id) DB에 insert*/
app.post('/register/dept',function(req,res){
	var data={
		"학과ID":req.body.did,
		"학과이름":req.body.dname,
		"분야":req.body.dept,
		"학과담당자":req.body.dmanager,
		"이메일":req.body.demail,
		"핸드폰번호":req.body.dphone,
		"기관ID":req.body.id
	};

	console.log(data);

	var sql='INSERT INTO 학과 SET ?';
	conn.query(sql,data,function(err,rows,fields){ 
		if(err){
			console.log("err : "+err);
			res.status(500).send('Internal Server Error333');
		} else { 
			console.log("register success!");
			res.render('success_dept');
		}
	});
});


/*dept list page*/
app.get('/deptList',function(req,res){
	var sql='SELECT * FROM 학과';
	conn.query(sql,function(err,rows,fields){
		if(err) console.log("err :"+err);
		res.render('DeptList_backup',{rows:rows});
	});
});


/*class list page*/
app.get('/classList',function(req,res){
	var sql='SELECT * FROM 개설과목';
	conn.query(sql,function(err,rows,fields){
		if(err) console.log("err :"+err);
		res.render('ClassList_backup',{rows:rows});
	});
});




/*class 영역*/
/*app.get(['/register/choice2'],function(req,res){
	var sql='SELECT 기관ID, 기관이름 FROM 기관';
	conn.query(sql,function(err,rows,fields){
		var id = req.params.id;
		if(id){
			res.render('DeptChoice',{id});
			console.log(id);
		} else {
			res.render('CenterChoice2',{rows:rows});
		}
	});
});*/

/*기관선택, 학과선택*/
app.get(['/register/choice2'], function(req,res){
	var sql = 'SELECT 학과ID, 학과이름 FROM 학과';
	var sql2 = 'SELECT 강사ID, 이름 FROM 강사';
	/*---test---*/
	var sql3 = 'SELECT 기관ID, 기관이름 FROM 기관';
	/*d_sql은 sql이 대신하고 있음*/

	conn.query(sql, function(err,rows,fields){
		if(err){
			console.log(err);
		} else {
			conn.query(sql2, function(err,rows2){
			if(err) console.error("err : "+err);
				{
				conn.query(sql3,function(err,rows3){
					if(err) console.error("err : "+err);
					res.render('register_class2',{rows:rows, rows2:rows2, rows3:rows3});
					console.log(rows, rows2, rows3);
					})
				}
			});
		}
	});
});



/*개설 과목 등록*/
app.post('/register/choice2',function(req,res){
	var data = {
		"과목ID":req.body.cid,
		"과목차수":req.body.ctime,
		"강사ID": req.body.tid,
		"개설인원":req.body.cnumber,
		"강의시작일":req.body.cstart,
		"강의종료일":req.body.cend,
		"현재개설여부":req.body.copen,
		"과목현황":req.body.cstatus,
		"과목명":req.body.cname,
		"학과ID":req.body.second_select,	/*180322 수정*/
		"등록여부":req.body.cregist
	};
	console.log(data);

	var sql = 'INSERT INTO 개설과목 SET ?';
	conn.query(sql, data, function(err,rows,fields){
		if(err){
			console.log("err : "+err);
			res.status(500).send('Interval Server Error : insert');
		} else {
			console.log("register success!!");
			/*alert('등록이 완료되었습니다.');*/
			res.render('success_class');
		}
	});

});



/*main페이지에서 삭제 기능*/
app.get('/remove/:id',function(req,res){
	var id = req.params.id;
	var sql = 'DELETE FROM 기관 WHERE 기관ID ='+ mysql.escape(req.params.id);
	console.log(mysql.escape(req.params.id));
	conn.query(sql,[id],function(err,results){
		if(err) console.log("err :"+err);
		console.log(results.affectedRows);
		res.redirect('/main');
	});
});
/*예고없이 삭제됨 : 삭제 onClick="location.href='/remove/<%= id%>'" 때문*/


/*main 페이지에서 수정 기능*/
app.get('/modify/:id',function(req,res){
	var id = req.params.id;
	var sql='SELECT * FROM 기관 WHERE 기관ID='+mysql.escape(req.params.id);
	console.log(mysql.escape(req.params.id));
	conn.query(sql,[id],function(err,rows){
		if(err) console.log("err : "+err);
		console.log(rows);
		res.render('register_center_modify',{rows:rows});
	});
});





app.listen(3000,function(){
	console.log('Connected!');
});
