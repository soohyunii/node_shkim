
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

var flash = require('connect-flash');

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


app.get('/main',function(req,res){
	res.render('main');
});

/*기관 : mysql의 목록 출력*/
app.get('/main1',function(req,res){
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



/*개설과목 등록 시 기관선택*/
app.get(['/register/choice2'],function(req,res){
	var sql='SELECT 기관ID, 기관이름 FROM 기관';
	conn.query(sql,function(err,rows,fields){
		var id = req.params.id;
		if(id){
			res.render('register_class2',{id});
			console.log(id);
		} else {
			res.render('CenterChoice2',{rows:rows});
		}
	});
});

/*개설과목 등록 시 필요한 리스트 : 학과선택, 강사선택 등*/
app.get(['/register/choice2/:id'], function(req,res){
	var sql = 'SELECT 학과ID, 학과이름 FROM 학과 WHERE 기관ID='+mysql.escape(req.params.id);;
	var sql2 = 'SELECT 강사ID, 이름 FROM 강사';
	/*---test---*/

	conn.query(sql, function(err,rows,fields){
		if(err){
			console.log(err);
		} else {
			conn.query(sql2, function(err,rows2){
			if(err) console.error("err : "+err);
				res.render('register_class2',{rows:rows, rows2:rows2});
				console.log(rows, rows2);
			});
		}
	});
});



/*개설 과목 등록*/
app.post('/register/choice2/:id',function(req,res){
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
			res.render('success_class');
		}
	});

});



/*기관 삭제 페이지*/
app.get('/remove/success/:id',function(req,res){
	var id = req.params.id;
	var sql = 'DELETE FROM 기관 WHERE 기관ID ='+ mysql.escape(req.params.id);
	console.log(mysql.escape(req.params.id));
	conn.query(sql,[id],function(err,results){
		if(err) console.log("err :"+err);
		console.log(results.affectedRows);
		res.redirect('/main');
	});
});

app.get('/remove/:id', function(req,res){
	var id = req.params.id;
	var sql='SELECT 기관ID, 기관이름 FROM 기관 WHERE 기관ID ='+ mysql.escape(req.params.id);
	conn.query(sql,[id],function(err,rows){
		if(err) console.log(err);
		console.log(rows);
		res.render('Remove',{rows:rows});
	});
});


/*main 페이지에서 수정 기능 - 기관 수정 */
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

/*update 구문 - 기관 수정 페이지*/
app.post('/modify/success/:id',function(req,res){
	var id = req.params.id;
	var password = req.body.password;
	var centername = req.body.centername;
	var name = req.body.name;
	var address = req.body.address;
	var manager = req.body.manager;
	var email = req.body.email;
	var phone = req.body.phone;
	var sql = 'UPDATE 기관 SET PASSWORD=?,기관명=?,기관이름=?,주소=?,기관담당자=?,이메일=?,핸드폰번호=? WHERE 기관ID = '+mysql.escape(req.params.id);
	conn.query(sql,[password,centername,name,address,manager,email,phone,id],function(err,rows){
		if(err) console.log("err : "+err);
		console.log(rows);
		res.render('success_center',{rows:rows});
	});
});


/*main 페이지에서 수정 기능 - 학과 수정 */
app.get('/modifyDept/:did/:id',function(req,res){
	var id = req.params.id;
	var did = req.params.did;
	var sql='SELECT * FROM 학과 WHERE 학과ID='+mysql.escape(req.params.did);
	console.log(mysql.escape(req.params.did));
	conn.query(sql,[did],function(err,rows){
		if(err) console.log("err : "+err);
		console.log(rows);
		res.render('register_dept_modify',{rows:rows});
	});
});


/*update 구문 - 학과 수정 페이지*/
app.post('/modifyDept/success/:did/:id',function(req,res){
	var did = req.params.did;
	var dname = req.body.dname;
	var dept = req.body.dept;
	var dmanager = req.body.dmanager;
	var demail = req.body.demail;
	var dphone = req.body.dphone;
	var id = req.params.id;
	var sql = 'UPDATE 학과 SET 학과이름=?,분야=?,학과담당자=?,이메일=?,핸드폰번호=?, 기관ID=? WHERE 학과ID = '+mysql.escape(req.params.did);
	conn.query(sql,[dname,dept,dmanager,demail,dphone,id,did],function(err,rows){
		if(err) console.log("err : "+err);
		console.log(rows);
		res.render('success_dept',{rows:rows});
	});
});


/*학과 삭제 페이지*/
app.get('/removeDept/success/:did',function(req,res){
	var did = req.params.did;
	var sql = 'DELETE FROM 학과 WHERE 학과ID ='+ mysql.escape(req.params.did);
	console.log(mysql.escape(req.params.did));
	conn.query(sql,[did],function(err,results){
		if(err) console.log("err :"+err);
		console.log(results.affectedRows);
		res.redirect('/deptList');
	});
});

app.get('/removeDept/:did', function(req,res){
	var did = req.params.did;
	var sql='SELECT 학과ID, 학과이름 FROM 학과 WHERE 학과ID ='+ mysql.escape(req.params.did);
	conn.query(sql,[did],function(err,rows){
		if(err) console.log(err);
		console.log(rows);
		res.render('RemoveDept',{rows:rows});
	});
});



/*main 페이지에서 수정 기능 - 개설과목 수정 */
app.get('/modifyClass/:cid/:did',function(req,res){
	var cid = req.params.cid;
	var did = req.params.did;
	var sql='SELECT * FROM 개설과목 WHERE 과목ID='+mysql.escape(req.params.cid);
	var sql2='SELECT 강사ID, 이름 FROM 강사';
	console.log(mysql.escape(req.params.cid));
	conn.query(sql,[cid],function(err,rows){
		if(err) console.log("err : "+err);
		{
			conn.query(sql2,function(err,rows2){
				if(err) console.log("err : "+err);
				res.render('register_class_modify',{rows:rows, rows2:rows2});
				console.log(rows, rows2);
			});
		}
	});
});


/*update 구문 - 개설과목 수정 페이지*/
app.post('/modifyClass/success/:cid/:did',function(req,res){
	var cid = req.params.cid;
	var ctime = req.body.ctime;
	var tid = req.body.tid;
	var cnumber = req.body.cnumber;
	var cstart = req.body.cstart;
	var cend = req.body.cend;
	var copen = req.body.copen;
	var cstatus = req.body.cstatus;
	var cname = req.body.cname;
	var did = req.params.did;
	var cregist = req.body.cregist;
	var sql = 'UPDATE 개설과목 SET 과목차수=?,강사ID=?,개설인원=?,강의시작일=?,강의종료일=?, 현재개설여부=?, 과목현황=?, 과목명=?, 학과ID=?, 등록여부=? WHERE 과목ID = '+mysql.escape(req.params.cid);
	conn.query(sql,[ctime,tid,cnumber,cstart,cend,copen,cstatus,cname,did,cregist,cid],function(err,rows){
		if(err) console.log("err : "+err);
		console.log(rows);
		res.render('success_class',{rows:rows});
	});
});


/*개설과목 삭제 페이지*/
app.get('/removeClass/success/:cid',function(req,res){
	var cid = req.params.cid;
	var sql = 'DELETE FROM 개설과목 WHERE 과목ID ='+ mysql.escape(req.params.cid);
	console.log(mysql.escape(req.params.cid));
	conn.query(sql,[cid],function(err,results){
		if(err) console.log("err :"+err);
		console.log(results.affectedRows);
		res.redirect('/classList');
	});
});

app.get('/removeClass/:cid', function(req,res){
	var cid = req.params.cid;
	var sql='SELECT 과목ID, 과목명 FROM 개설과목 WHERE 과목ID ='+ mysql.escape(req.params.cid);
	conn.query(sql,[cid],function(err,rows){
		if(err) console.log(err);
		console.log(rows);
		res.render('RemoveClass',{rows:rows});
	});
});




app.listen(3000,function(){
	console.log('Connected!');
});
