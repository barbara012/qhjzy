var ObjectID = require('mongodb').ObjectID,
	mongodb = require('./db'),
	markdown = require('markdown').markdown;

function PostJob(title, content) {
	this.title = title;
	this.content = content;
}

module.exports = PostJob;

//存储一篇文章及其相关信息
PostJob.prototype.save = function(callback) {
	var date = new Date();
	//存储各种时间格式，方便以后扩展
	var time = {
		date: date,
		year : date.getFullYear(),
		month : date.getFullYear() + "-" + (date.getMonth() + 1),
		day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
		minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
		date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
	}
	//要存入数据库的文档
	var job = {
		time: time,
		title: this.title,
		content: this.content,
		pv: 0
	};
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 jobs 集合
		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//将文档插入 jobs 集合
			collection.insert(job, {
				safe: true
			}, function (err) {
				mongodb.close();
				if (err) {
				 	return callback(err);//失败！返回 err
				}
				// db.collection('users', function(err, collect) {
				// 	if (err) {
				// 		mongodb.close();
				// 		return callback(err);
				// 	}
				// 	collect.update(
				// 		{
				// 			'name': PostJob.name
				// 		},
				// 		{
				// 			$inc: {'jobs': 1}
				// 		},
				// 		function (err) {
				// 			mongodb.close();
				// 			if (err) {
				// 				return callback(err);
				// 			}
				// 		}
				// 	);
				// })
				callback(null);//返回 err 为 null
			});
		});
	});
};

//一次获取十篇文章
PostJob.getTen = function(page, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 jobs 集合
		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var query = {};
			//使用 count 返回特定查询的文档数 total
			collection.count(query, function (err, total) {
			//根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
				collection.find(query, {
					skip: (page - 1)*10,
					limit: 10
				}).sort({
					time: -1
				}).toArray(function (err, docs) {
					mongodb.close();
					if (err) {
						return callback(err);
					}
					//解析 markdown 为 html
					// docs.forEach(function (doc) {
					// 	doc.PostJob = markdown.toHTML(doc.PostJob);
					// });
					callback(null, docs, total);
				});
			});
		});
	});
};
//获取一篇文章
PostJob.getOne = function(id, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 jobs 集合

		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//根据用户名、发表日期及文章名进行查询
			collection.findOne(
				{
					'_id': new ObjectID(id)
				},
				function (err, job) {
					if (err) {
						mongodb.close();
						return callback(err);
					}
					if (job) {
					//每访问 1 次，pv 值增加 1
						collection.update(
							{
								'_id': new ObjectID(id)
							},
							{
								$inc: {"pv": 1}
							},
							function (err) {
								mongodb.close();
								if (err) {
									return callback(err);
								}
							}
						);
						callback(null, job);//返回查询的一篇文章
					}
				}
			);
		});
	});
};
//返回原始发表的内容（markdown 格式）
PostJob.edit = function(id, callback) {  	
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({
				'_id': new ObjectID(id)
			}, function (err, job) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, job);
			});
		});
	});
};
//更新一篇文章及其相关信息
PostJob.update = function(id, title, content, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		//读取 jobs 集合
		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//更新文章内容
			collection.update({
				"_id": new ObjectID(id)
			}, {
				$set: {
					title: title,
					content: content
				}
			}, function (err) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
};
//删除一篇文章
PostJob.remove = function(id, callback) {
	//打开数据库
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
	//读取 jobs 集合
		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
		//查询要删除的文档
			collection.findOne({
				"_id": new ObjectID(id)
			}, function (err, job) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
			//删除转载来的文章所在的文档
				collection.remove(
					{
						"_id": new ObjectID(id)
					},
					{
						w: 1
					},
					function (err) {	
						mongodb.close();
						if (err) {
							return callback(err);
						}
						callback(null);
					}
				);
			});
		});
	});
};
PostJob.getAll = function (callback) {
	mongodb.open(function (err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('jobs', function (err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			//根据用户名查出所以文章id
			collection.find(
				{},
				{}
			).sort(
				{
					time: -1
				}
			).toArray(function (err, jobs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, jobs);
			});
		});
	});
};
