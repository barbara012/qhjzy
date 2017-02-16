var ObjectID = require('mongodb').ObjectID,
    mongodb = require('./db'),
    markdown = require('markdown').markdown;

function Post(title, url) {
    this.title = title;
    this.url = url;
}

module.exports = Post;

//存储一个链接及其相关信息
Post.prototype.save = function(callback) {
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    };
    //要存入数据库的文档
    var link = {
        time: time,
        title: this.title,
        url: this.url,
        pv: 0
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 products 集合
        db.collection('links', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入 products 集合
            collection.insert(link, {
                safe: true
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                callback(null);//返回 err 为 null
            });
        });
    });
};

//一次获取十个行业链接
Post.getTen = function(page, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 links 集合
        db.collection('links', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            collection.count(query, function (err, total) {
                collection.find(query, {
                    skip: (page - 1) * 10,
                    limit: 10
                }).sort({
                    time: -1
                }).toArray(function (err, links) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null, links, total);
                });
            });
        });
    });
};
//返回原始发表的内容（markdown 格式）
Post.edit = function(id, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 links 集合
        db.collection('links', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                '_id': new ObjectID(id)
            }, function (err, link) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, link);
            });
        });
    });
};
//更新一个链接及其相关信息
Post.update = function(id, title, url, callback) {
    var date = new Date(),
        time = {
            date: date,
            year : date.getFullYear(),
            month : date.getFullYear() + "-" + (date.getMonth() + 1),
            day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
            minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
        };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 links 集合
        db.collection('links', function (err, collection) {
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
                    time: time,
                    url: url
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
//删除一个链接
Post.remove = function(id, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 links 集合
        db.collection('links', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //查询要删除的文档
            collection.findOne({
                "_id": new ObjectID(id)
            }, function (err, link) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                //删除转载来的产品所在的文档
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
Post.getAll = function (callback) {
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('links', function (err, collection) {
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
            ).toArray(function (err, arrayId) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, arrayId);
            });
        });
    });
};
