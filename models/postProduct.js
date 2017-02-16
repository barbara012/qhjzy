var ObjectID = require('mongodb').ObjectID,
    mongodb = require('./db'),
    markdown = require('markdown').markdown;

function Post(title, desc, product) {
    this.title = title;
    this.desc = desc;
    this.product = product;
}

module.exports = Post;

//存储一篇产品及其相关信息
Post.prototype.save = function(callback) {
    console.log('111111');
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
        title: this.title,
        desc: this.desc,
        product: this.product,
        pv: 0
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        console.log('222222');
        //读取 products 集合
        db.collection('products', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            console.log('333333');
            //将文档插入 products 集合
            collection.insert(product, {
                safe: true
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                console.log('444444');
                callback(null);//返回 err 为 null
            });
        });
    });
};

//一次获取十个产品
Post.getTen = function(page, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 products 集合
        db.collection('products', function (err, collection) {
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
                }).toArray(function (err, products) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    //解析 markdown 为 html
                    // products.forEach(function (product) {
                    //     doc.post = markdown.toHTML(doc.post);
                    // });
                    callback(null, products, total);
                });
            });
        });
    });
};
//获取一个产品
Post.getOne = function(id, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 products 集合

        db.collection('products', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名、发表日期及产品名进行查询
            collection.findOne(
                {
                    '_id': new ObjectID(id)
                },
                function (err, product) {
                    if (err) {
                        mongodb.close();
                        return callback(err);
                    }
                    if (product) {
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

                        //解析 markdown 为 html
                        // doc.post = markdown.toHTML(doc.post);
                        callback(null, product);//返回查询的一个产品
                    }
                }
            );
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
        //读取 news 集合
        db.collection('products', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名、发表日期及文章名进行查询
            collection.findOne({
                '_id': new ObjectID(id)
            }, function (err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, doc);//返回查询的一篇文章（markdown 格式）
            });
        });
    });
};
//更新一篇文章及其相关信息
Post.update = function(id, title, desc, product, callback) {
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
        //读取 news 集合
        db.collection('products', function (err, collection) {
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
                    desc: desc,
                    product: product
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
//删除一个产品
Post.remove = function(id, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 news 集合
        db.collection('products', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //查询要删除的文档
            collection.findOne({
                "_id": new ObjectID(id)
            }, function (err, doc) {
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
