module.exports = {
	"port": 3001, // load balance port.
	"host": "127.0.0.1",
	"middleware": [
		"session_id", "subway",
	],
	// this config same as node-mysql module
	// please check it details before change it
	"mysql": {
		"database": "subwaydb2",
		"host": "127.0.0.1",
		"user": "root",
		"password": "admin",
		"charset": "UTF8_GENERAL_CI",
		"debug": false,
		"poolLimit": 10,
	},
	"staticDir": "statics",
	"fileServer": "http://192.168.1.100:3001",
	"selfServer": "http://127.0.0.1:3001",
	// "ssl": {
	// 	"privatekey": "ssl/privkey.pem",
	// 	"certkey": "ssl/cacert.pem",
	// 	"port": "443",
	// },
	// Enable cleaner to make sure output field is super lightweight
	"scavenger": true,
	// Checkin data
	'checkin': {
		"shareimage": "/medias/uploads/logo/subway.png",
		"sharecontent_en": "Great values at my favorite Subway store",
		"sharecontent_cn": "Great values at my favorite Subway store",
	},
	// baidu config.
	"baidumap": {
		"referer": "subway",
		"title": "SUBWAY",
		"content": "SUBWAY STORE"
	},
	"thumbnailes": ["186_186", "213_213"],
	// Because some thing like coupon has region limit, so we must search coupon by around.
	// unit: km
	"search_around": "20",
	"event_around": "1", 
	"fileupload": {
		"keepExtensions": false,
		"distUploadDir": "./statics/uploaddir",
		"uploadDir": "./tmp/subwayapi",
	},
	"event_media_conver_name": "cover",
	"banlancer": [
		{
			host: "127.0.0.1",
			port: 3002
		}, {
			host: "127.0.0.1",
			port: 3003
		}, {
			host: "127.0.0.1",
			port: 3004
		}, {
			host: "127.0.0.1",
			port: 3005
		}, {
			host: "127.0.0.1",
			port: 3006
		}
	]
}
