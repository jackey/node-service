  'check' :  function(req, res, db, query) {

			var sql  = 'SELECT usr_id FROM user_usr WHERE usr_id = 3013';
			var data = [];

			return db.query(sql, data, function (err, result) {
							
							if (err) {
									console.error({error:err,where:'/profile/check'});
									res.send({error: 'error_mysql'}); 
									return;
							}
							else {
								if (result.length) {
									res.send({error: "error_no_user"});
								}
								else {
									res.send(result[0].usr_id);
								}
							}

					});
			
  }
  
  ACTION=$1

DATE=`date +%Y%m%d%H%M%S`


case $ACTION in

start)
    /bin/bash -c "ulimit -n 4092; exec node  /home/app/mn/server-secure.js 2>/home/app/mn/logs/err-secure-$DATE.log 1>/home/app/mn/logs/node-secure-$DATE.log &"
    ;;

stop)
    killall -9 node
    ;;
restart)
    bash $0 stop; bash $0 start
    ;;

*)
    echo "Usage: $0 {start| stop| restart}"
    ;;
esac
