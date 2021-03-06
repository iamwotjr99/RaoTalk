const express = require('express');
const router = express.Router();
const path = require('path');
const dbPool = require('./dbconfig'); 

router.get('/', serverTest);

router.get('/qgis2web0', (req, res) => {
    res.sendFile(path.join(__dirname, '/qgis2web_total/index.html'));
})

router.get('/qgis2web1', (req, res) => {
    res.sendFile(path.join(__dirname, '/qgis2web_oneThousand/index.html'));
})

router.get('/qgis2web2', (req, res) => {
    res.sendFile(path.join(__dirname, '/qgis2web_twoThousand/index.html'));
})

router.get('/qgis2web3', (req, res) => {
    res.sendFile(path.join(__dirname, '/qgis2web_threeThousand/index.html'));
})

router.get('/qgis2web4', (req, res) => {
    res.sendFile(path.join(__dirname, '/qgis2web_fourThousand/index.html'));
})

router.get('/qgis2web5', (req, res) => {
    res.sendFile(path.join(__dirname, '/qgis2web_fiveThousand/index.html'));
})

// 로그인
router.get('/get/user/:email/:password', (req, res) => {
    let email = req.params.email;
    let password = req.params.password;

    console.log(email, password);
    dbPool.getConnection((err, conn) => {
        if(err) {
            err.code = 500;
            return err;
        }

        let sql = 'SELECT * FROM user WHERE password = ? AND email = ?';
    
        conn.query(sql, [password, email], (err, result) => {
            if(err) {
                err.code = 500;
                conn.release();
                return err;
            }

            let resultData = {
                user_id: result[0].user_id,
                name: result[0].name,
                email: result[0].email,
                password: result[0].password,
                profile: result[0].profile
            }

            console.log(resultData.user_id);
            
            res.send(resultData);
            console.log(resultData);
            console.log('Get Login Success!');
            conn.release();
        })
    })
});

// 회원가입
router.post('/post/user', (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    console.log(name);
    
    dbPool.getConnection((err, conn) => {
        if(err) {
            err.code = 500;
            console.log("error");
            return err;
        }
        let sql = 'INSERT INTO user (name, email, password) VALUES(?,?,?);'
        conn.query(sql, [name, email, password], (err, result) => {
            if(err) {
                err.code = 500;
                console.log("error");
                conn.release();
                return err;
            }

            conn.release();
            console.log(name, email, password);
            res.send(result);
            console.log('Post Success!');
        })
    })
})


// 프로필 사진 설정
router.put('/put/user/profile', (req, res) => {
    let email = req.body.email;
    let profile = req.body.profile;
    dbPool.getConnection((err, conn) => {
        if(err) {
            err.code = 500;
            console.log("error");
            return err;
        }
        let sql = 'UPDATE user SET profile=? WHERE email=?'
        conn.query(sql, [profile, email], (err, result) => {
            if(err) {
                err.code = 500;
                console.log("error");
                conn.release();
                return err;
            }

            conn.release();
            console.log(profile, email);
            res.send(result);
            console.log('Profile Put Success!');
        })
    })
})

// user_id를 통해서 친구데이터 가져오기
router.get("/get/user/:user_id", (req, res) => {
    let user_id = req.params.user_id;

    console.log(user_id);
    dbPool.getConnection((err, conn) => {
        if(err) {
            err.code = 500;
            console.log("error");
            return err;
        }

        let sql = "SELECT * from user WHERE user_id = ?";

        conn.query(sql, user_id, (err, result) => {
            if(err) {
                err.code = 500;
                console.log("error");
                conn.release();
                return err;
            }

            res.send(result[0]);
            console.log(result[0]);
            conn.release();
        })
    })
})

// 친구의 user_id를 통해서 friends 테이블에 친구 데이터 POST
router.post("/post/user/:user_id/add/:friend_id", (req, res) => {
    let user_id = req.params.user_id;
    let friend_id = req.params.friend_id;
    let friend_name = req.body.name;
    let friend_email = req.body.email;
    let friend_password = req.body.password;
    let frined_profile = req.body.profile;

    console.log(friend_name);

    dbPool.getConnection((err, conn) => {
        if(err) {
            err.code = 500;
            console.log("error");
            return err;
        }

        let sql = "INSERT INTO friend (friend_id, user_id, fr_name, fr_email, fr_password, fr_profile) VALUES (?, ?, ?, ?, ?, ?)"

        conn.query(sql, [friend_id, user_id, friend_name, friend_email, friend_password, frined_profile], (err, result) => {
            if(err) {
                err.code = 500;
                console.log("error");
                conn.release();
                return err;
            }

            res.send(result);
            console.log(result);
            console.log("Post Friends Success!");
        })
    })
})

// user_id에 맞는 친구리스트 가져오기
router.get("/get/:user_id/friendsList", (req, res) => {
    let user_id = req.params.user_id;


    console.log(user_id);
    dbPool.getConnection((err, conn) => {
        if(err) {
            err.code = 500;
            console.log("error");
            return err;
        }

        let sql = "SELECT * FROM friend WHERE user_id = ?;"
       
        conn.query(sql, user_id, (err, result) => {
            if(err) {
                err.code = 500;
                console.log("error");
                conn.release();
                return err;
            }
        
            console.log(result);
            res.send(result);
            conn.release();
            
        })
    })
})
// 채팅방 생성하기
router.post("/post/:user_id/chatList/:roomName", (req, res) => {
    let roomName = req.params.roomName;
    let user_id = req.params.user_id;

    console.log(roomName);
    dbPool.getConnection((err, conn) => {
        if(err) {
            err.code = 500;
            return err;
        }
        
        let sql1 = "INSERT INTO room (name) VALUES (?);"
        let sql2 = "INSERT INTO entry (user_id, room_id) VALUES (?, ?);"
        conn.query(sql1, roomName, (err, result) => {
            if(err) {
                err.code = 500;
                conn.release();
                return err;
            }
            let room_id = result.insertId;

            conn.query(sql2, [user_id, room_id], (err, resultEntry) => {
                if(err) {
                    err.code = 500;
                    conn.release();
                    return err;
                }

                console.log("Post Entry Success!!");
                conn.release();
            })

            res.send(result);
            console.log("Post chatRoom Success!!");
        })
    })
})

// user_id에 맞는 채팅방 가져오기
router.get("/get/:user_id/chatList", (req, res) => {
    let user_id = req.params.user_id;

    dbPool.getConnection((err, conn) => {
        if(err) {
            err.code = 500;
            console.log("error");
            return err;
        }

        let sql1 = "SELECT entry.user_id AS user_id, room.room_id AS room_id, room.name AS roomName FROM entry LEFT JOIN room ON entry.room_id = room.room_id WHERE user_id = ?;"

        conn.query(sql1, user_id, (err, result) => {
            if(err) {
                err.code = 500;
                console.log("error");
                conn.release();
                return err;
            }

            console.log(result);
            res.send(result);
            conn.release();
        })
    })
})

// user_id, room_id를 통해 채팅방에 친구 초대하기
router.post("/post/invite/:user_id/:room_id", (req, res) => {
    let user_id = req.params.user_id;
    let room_id = req.params.room_id;

    console.log(user_id, room_id);

    dbPool.getConnection((err, conn) => {
        if(err) {
            err.code = 500;
            return err;
        }

        let sql1 = "INSERT INTO entry (user_id, room_id) VALUES(?, ?)"
        conn.query(sql1, [user_id, room_id], (err, result) => {
            if(err) {
                err.code = 500;
                conn.release();
                return err;
            }

            res.send(result);
            console.log("Invite Post Success!");
            conn.release();
        })
    })
})

//캘린더 내용 설정
router.post('/post/calendar/:cost/:memo/:date/user/:user_id', (req, res) => {
    let cost = req.params.cost;
    let memo = req.params.memo;
    let date = req.params.date;
    let user_id = req.params.user_id;

    console.log("Post: {cost}: ", cost, ", {memo}: ", memo, ", {date}: ", date);
    dbPool.getConnection((err, conn) => {
        if(err) {
            err.code = 500;
            return err;
        }
        
        let sql = 'INSERT INTO Calender (user_id, Date, Cost, Memo) VALUES(?,?,?,?);'

        
        conn.query(sql, [user_id, date, cost, memo], (err, result) => {
            if(err) {
                err.code = 500;
                conn.release();
                return err;
            }
            
            res.send(result);
            conn.release();
            console.log(result);
            console.log('Post Success!');
        })
    })
})

//캘린더 정보 보내기
router.get('/get/calendar/:date/user/:user_id', (req, res) => {
    let date = req.params.date;
    let user_id = req.params.user_id;

    console.log("{date}: ", date);
    dbPool.getConnection((err, conn) => {
        if(err) {
            err.code = 500;
            return err;
        }

        let sql = 'SELECT * FROM Calender WHERE Date = ? AND user_id = ?';
    
        conn.query(sql, [date, user_id], (err, result) => {

            if(err) {
                err.code = 500;
                conn.release();
                return err;
            }
            
            res.send(result);
            conn.release();
            console.log(result);
            console.log('Get Success!');
        })
    })
})

//캘린더 값 삭제 
router.delete('/delete/calendar/:date/user/:user_id', (req, res) => {
    let date = req.params.date;
    let user_id = req.params.user_id;

    dbPool.getConnection((err, conn) => {
        if(err) {
            err.code = 500;
            console.log("error");
            return err;
        }
        let sql = ' DELETE FROM Calender WHERE Date=? AND user_id = ?'

        conn.query(sql, [date, user_id], (err, result) => {
            if(err) {
                err.code = 500;
                console.log("error");
                conn.release();
                return err;
            }

            conn.release();
            console.log(date);
            res.send(result);
            console.log('Delete Success!');
        })
    })
})

//채팅방 목록
router.post('/post/chatList/:title', (req, res) => {
    let title = req.params.title;
    console.log("Post: {title}", title);

    res.send(title);
})

router.get('/get/chatList/:title', (req, res) => {
    let title = req.params.title;
    console.log("Get: {title}", title);

    res.send(title);
})

function serverTest(req, res) {
    res.send('Hello World!!');
}

module.exports = router;