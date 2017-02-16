var ObjectID = require('mongodb').ObjectID,
    mongodb = require('./db'),
    markdown = require('markdown').markdown;

function Post(partner) {
    this.partner = partner;
}

module.exports = Post;

//存储一个合作伙伴及其相关信息
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
    var product = {
        time: time,
        partner: this.partner,
        pv: 0
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 partners 集合
        db.collection('partners', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入 partners 集合
            collection.insert(product, {
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

//一次获取十个合伙伙伴
Post.getTen = function(page, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 products 集合
        db.collection('partners', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            //使用 count 返回特定查询的文档数 total
            collection.count(query, function (err, total) {
                //根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
                collection.find(query, {
                    skip: (page - 1) * 10,
                    limit: 10
                }).sort({
                    time: -1
                }).toArray(function (err, partners) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null, partners, total);
                });
            });
        });
    });
};
//获取指定数量
Post.getSome = function(limit, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 products 集合
        db.collection('partners', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            //使用 count 返回特定查询的文档数 total
            collection.find(query, {
                limit: limit
            }).sort({
                time: -1
            }).toArray(function (err, partners) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, partners);
            });
        });
    });
};
//获取一个合作伙伴
Post.getOne = function(id, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 partners 集合

        db.collection('partners', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名、发表日期及产品名进行查询
            collection.findOne(
                {
                    '_id': new ObjectID(id)
                },
                function (err, partner) {
                    if (err) {
                        mongodb.close();
                        return callback(err);
                    }
                    if (partner) {
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
                        callback(null, partner);//返回查询的一个产品
                    }
                }
            );
        });
    });
};

Post.edit = function(id, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 partners 集合
        db.collection('partners', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                '_id': new ObjectID(id)
            }, function (err, partner) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, partner);
            });
        });
    });
};
Post.update = function(id, partner, callback) {
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
        db.collection('partners', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.update({
                "_id": new ObjectID(id)
            }, {
                $set: {
                    partner: partner
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
Post.remove = function(id, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('partners', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                "_id": new ObjectID(id)
            }, function (err, doc) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
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
