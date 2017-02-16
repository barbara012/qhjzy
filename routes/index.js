
/*
 * GET home page.
 */
var crypto = require('crypto'),
	fs = require('fs'),
	//User = require('../models/user.js'),
	PostNew = require('../models/postNew.js'),
	PostJob = require('../models/postJob.js'),
	PostProduct = require('../models/postProduct.js'),
	PostPartner = require('../models/postPartner.js'),
	PostLink = require('../models/postLink.js'),
	Pic = require('../models/pic.js'),
	Message = require('../models/message.js'),
	//Email = require('../models/email.js'),
	markdown = require('markdown').markdown,
	passport = require('passport');
module.exports = function (app) {

	app.get('/', function (req, res) {
		PostPartner.getSome(10, function(err, partners) {
			if (err) {
				partners = [];
			}
			PostNew.getSome(3, 0, function(err1, news) {
				if (err1) {
					news = [];
				}
				res.render('index', {
					user: req.session.user,
					partners: partners,
					news: news,
					title: '青海聚之源新材料有限公司',
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});
		});
	});
	// //注册
	//app.get('/reg', function (req, res) {
	//	res.render('reg', {
	//		title: '注册',
	//		user: req.session.user,
	//		success: req.flash('success').toString(),
	//		error: req.flash('error').toString()});
	//});
	//app.post('/reg', checkNotLogin);
	//app.post('/reg', function (req, res) {
	//	var name = req.body.userName,
	//		md5 = crypto.createHash('md5'),
	//		reg = /`|~|!|#|\$|%|\^|\*|\(|\-|\)|\+|_|=|\/|\||\\|。|，|》|《|>|<|！/,
	//		password = md5.update(req.body.password).digest('hex');
	//	if (reg.test(name)) {
	//		req.flash('error', '用户名不包含非法字符');
	//		return res.redirect('/reg');
	//	}
	//	if (name.length > 20 || name.length === 0) {
	//		req.flash('error', '用户名过长');
	//		return res.redirect('/reg');
	//	}
	//	var newUser = new User({
	//		name: name,
	//		password: password,
	//		email: '838186163@qq.com'
	//	});
	//	//检查用户名与邮箱是否已经存在
	//	User.get(newUser.name, function (err, user) {
	//		if (user) {
	//			req.flash('error', '用户名已存在');
	//			return res.redirect('/');
	//		}
	//		//如果不存在则新增用户
	//		newUser.save(function (err, user) {
	//			if (err) {
	//				req.flash('error', '系统忙');
	//				return res.redirect('/');
	//			}
	//			req.session.user = user;//用户信息存入 session
	//			req.flash('success', '注册成功！');
	//			return res.redirect('/user_center');
	//		});
	//	});
	//});
	//关于我们
	app.get('/about_us', function (req, res) {
		res.render('about_us', {
			title: '关于我们-青海聚之源新材料有限公司',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	//企业介绍
	app.get('/company_desc', function (req, res) {
		res.render('company_desc', {
			title: '关于我们-青海聚之源新材料有限公司',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	//生产基地
	app.get('/base', function (req, res) {
		res.render('base', {
			title: '关于我们-青海聚之源新材料有限公司',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	//发布新闻
	app.get('/post_new', checkLogin);
	app.get('/post_new', function (req, res) {
		res.render('post_new', {
			title: '发布新闻-青海聚之源新材料有限公司',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/post_new', checkLogin);
	app.post('/post_new', function (req, res) {
		var post = new PostNew(req.body.newtype, req.body.newtitle, req.body.newcontent);
		post.save(function (err) {
			if (err) {
				req.flash('error', '发布失败');
				return res.redirect('/post_new');
			}
			req.flash('success', '发布成功!');
			res.redirect('/manager_new');
		});
	});
	//普通用户新闻中心
	app.get('/new_center', function (req, res) {
		//判断是否是第一页，并把请求的页数转换成 number 类型
        var type = req.query.newtype || '1';
        console.log(type);
		var page = req.query.p ? parseInt(req.query.p) : 1;
		//查询并返回第 page 页的 10 篇文章
		PostNew.getTen(page, type, function (err, news, total) {
			if (err) {
				news = [];
			}
			res.render('new_center', {
				title: '新闻中心-青海聚之源新材料有限公司',
				news: news,
				page: page,
                newtype: type,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + news.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//管理员后台新闻中心
	app.get('/manager_new', checkLogin);
	app.get('/manager_new', function (req, res) {
		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;
		//查询并返回第 page 页的 10 篇文章
		PostNew.getTen(page, 0, function (err, news, total) {
			if (err) {
				news = [];
			}
			res.render('manager_new', {
				title: '新闻中心-青海聚之源新材料有限公司',
				news: news,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + news.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//新闻1
	app.get('/new/:id', function (req, res) {
		PostNew.getOne(req.params.id, function (err, onenew) {
			if (err) {
				req.flash('error', err);
				console.log(err);
				return res.redirect('/new_center');
			};
			res.render('new', {
				title: onenew.title,
				onenew: onenew,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	////编辑新闻 
	app.get('/edit/new/:user/:id', checkLogin);
	app.get('/edit/new/:user/:id', function (req, res) {
		if (req.session.user.name === req.params.user) {
			PostNew.edit(req.params.id, function (err, onenew) {
				if (err) {
					req.flash('error', err);
					console.log(err);
					return res.redirect('/manager_new');
				};
				res.render('edit_new', {
                    type: onenew.type,
					title: onenew.title,
					onenew: onenew,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});
		} else {
			if (err) {
				req.flash('error', '没有权限');
				console.log(err);
				return res.redirect('/manager_new');
			};
		}

	});
	//编辑新闻 
	app.post('/edit/new/:id', checkLogin);
	app.post('/edit/new/:id', function (req, res) {
		PostNew.update(
			req.params.id,
			req.body.newtype,
			req.body.newtitle,
			req.body.newcontent, function (err) {
			if (err) {
				console.log('err');
				req.flash('error', err);
				return res.redirect('/manager_new');
			}
			req.flash('success', '修改成功!');
			return res.redirect('/manager_new');
		});
	});
	//删除新闻
	app.get('/delete/new/:user/:id', checkLogin);
	app.get('/delete/new/:user/:id', function(req, res) {
		if (req.session.user.name !== req.params.user) {
			req.flash('error', '权限不够');
			return res.redirect('manager_new');
		}
		PostNew.remove(req.params.id, function (err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			req.flash('success', '删除成功!');
			res.redirect('manager_new');
		});
	});

	//管理员后台产品中心
	app.get('/manager_product', checkLogin);
	app.get('/manager_product', function (req, res) {
		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;
		//查询并返回第 page 页的 10 篇文章
        PostProduct.getTen(page, function (err, products, total) {
			if (err) {
                products = [];
			}
			res.render('manager_product', {
				title: '产品中心-青海聚之源新材料有限公司',
				products: products,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + products.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
    //发布产品
    app.get('/post_product', checkLogin);
    app.get('/post_product', function (req, res) {
        res.render('post_product', {
            title: '发布产品-青海聚之源新材料有限公司',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.post('/post_product', checkLogin);
    app.post('/post_product', function (req, res) {

        console.log(req.body.title);
        console.log(req.body.desc);
        var product = req.files.product, dbImgUrl;
        if (product.size == 0){
            // 使用同步方式删除一个文件
            fs.unlinkSync(product.path);
            console.log('Successfully removed an empty file!');
        } else {

            var target_path = './public/images/dbimg/' + product.name;
            // 使用同步方式重命名一个文件
            fs.renameSync(product.path, target_path);

            dbImgUrl = '/images/dbimg/' + product.name;
        }
        var postProduct = new PostProduct(req.body.title, req.body.desc, dbImgUrl);
        postProduct.save(function (err) {
            if (err) {
                req.flash('error', '发布失败');
                return res.redirect('/post_product');
            }
            req.flash('success', '发布成功!');
            res.redirect('/manager_product');
        });
    });
    //编辑产品
    app.get('/edit/product/:id', checkLogin);
    app.get('/edit/product/:id', function (req, res) {
        PostProduct.edit(req.params.id, function (err, product) {
            if (err) {
                req.flash('error', err);
                console.log(err);
                return res.redirect('/manager_product');
            }
            res.render('edit_product', {
                product: product,
                title: '编辑-' + product.title,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });

    });
    app.post('/edit/product/:id', checkLogin);
    app.post('/edit/product/:id', function (req, res) {
        var product = req.files.product, dbImgUrl;
        if (req.body.pic) {
            dbImgUrl = req.body.pic;
        } else {
            if (product.size == 0){
                // 使用同步方式删除一个文件
                fs.unlinkSync(product.path);
                console.log('Successfully removed an empty file!');
            } else {

                var target_path = './public/images/dbimg/' + product.name;
                // 使用同步方式重命名一个文件
                fs.renameSync(product.path, target_path);

                dbImgUrl = '/images/dbimg/' + product.name;
            }
        }
        PostProduct.update(
            req.params.id,
            req.body.title,
            req.body.desc,
            dbImgUrl,function (err) {
                if (err) {
                    console.log('err');
                    req.flash('error', err);
                    return res.redirect('/manager_product');
                }
                req.flash('success', '修改成功!');
                return res.redirect('/manager_product');
            });
    });
    //删除产品
    app.get('/delete/product/:id', checkLogin);
    app.get('/delete/product/:id', function(req, res) {
        PostProduct.remove(req.params.id, function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '删除成功!');
            res.redirect('manager_product');
        });
    });

    // //产品展示
	app.get('/product_show', function (req, res) {
        var page = req.query.p ? parseInt(req.query.p) : 1;
        // 查询并返回第 page 页的 10 篇文章
        PostProduct.getTen(page, function (err, products, total) {
            if (err) {
                products = [];
            }
            res.render('product_show', {
                title: '产品展示-青海聚之源新材料有限公司',
                products: products,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 10 + products.length) == total,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
	});
	//产品详情
	app.get('/product/:id', function (req, res) {
		// 查询并返回第 page 页的 10 篇文章
		PostProduct.getOne(req.params.id, function (err, product) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			res.render('product', {
				title: '产品展示-青海聚之源新材料有限公司',
				product: product,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	//合作伙伴
	app.get('/partner_show', function (req, res) {
		var page = req.query.p ? parseInt(req.query.p) : 1;
		// 查询并返回第 page 页的 10 个合作伙伴
		PostPartner.getTen(page, function (err, partners, total) {
			if (err) {
				partners = [];
			}
			res.render('partner_show', {
				title: '合作伙伴-青海聚之源新材料有限公司',
				partners: partners,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + partners.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//合作伙伴管理后台
	app.get('/manager_partner', checkLogin);
	app.get('/manager_partner', function (req, res) {
		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;
		//查询并返回第 page 页的 10 篇文章
		PostPartner.getTen(page, function (err, partners, total) {
			if (err) {
				products = [];
			}
			res.render('manager_partner', {
				title: '管理合作伙伴-青海聚之源新材料有限公司',
				partners: partners,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + partners.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//上传合作伙伴
	app.get('/post_partner', checkLogin);
	app.get('/post_partner', function (req, res) {
		res.render('post_partner', {
			title: '上传合作伙伴-青海聚之源新材料有限公司',
			editType: 'new',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/post_partner', checkLogin);
	app.post('/post_partner', function (req, res) {
		var partner = req.files.partner, dbImgUrl;
		if (partner.size == 0){
			// 使用同步方式删除一个文件
			fs.unlinkSync(partner.path);
			console.log('Successfully removed an empty file!');
		} else {

			var target_path = './public/images/dbimg/' + partner.name;
			// 使用同步方式重命名一个文件
			fs.renameSync(partner.path, target_path);

			dbImgUrl = '/images/dbimg/' + partner.name;
		}
		var postPartner = new PostPartner(dbImgUrl);
		postPartner.save(function (err) {
			if (err) {
				req.flash('error', '发布失败');
				return res.redirect('/post_partner');
			}
			req.flash('success', '发布成功!');
			res.redirect('/manager_partner');
		});
	});
	//编辑合作 伙伴
	app.get('/edit/partner/:id', checkLogin);
	app.get('/edit/partner/:id', function (req, res) {
		PostPartner.edit(req.params.id, function (err, partner) {
			if (err) {
				req.flash('error', err);
				console.log(err);
				return res.redirect('/manager_partner');
			}
			console.log(partner);
			res.render('post_partner', {
				partner: partner,
				editType: 'edit',
				title: '重新上传合作伙伴LOGO-青海聚之源新材料有限公司' ,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});

	});
	app.post('/edit/partner/:id', checkLogin);
	app.post('/edit/partner/:id', function (req, res) {
		var product = req.files.product, dbImgUrl;
		if (req.body.pic) {
			dbImgUrl = req.body.pic;
		} else {
			if (product.size == 0){
				// 使用同步方式删除一个文件
				fs.unlinkSync(product.path);
				console.log('Successfully removed an empty file!');
			} else {

				var target_path = './public/images/dbimg/' + product.name;
				// 使用同步方式重命名一个文件
				fs.renameSync(product.path, target_path);

				dbImgUrl = '/images/dbimg/' + product.name;
			}
		}
		PostPartner.update(
			req.params.id,
			dbImgUrl,function (err) {
				if (err) {
					console.log('err');
					req.flash('error', err);
					return res.redirect('/manager_partner');
				}
				req.flash('success', '修改成功!');
				return res.redirect('/manager_partner');
			});
	});
	//删除合作伙伴
	app.get('/delete/partner/:id', checkLogin);
	app.get('/delete/partner/:id', function(req, res) {
		PostPartner.remove(req.params.id, function (err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			req.flash('success', '删除成功!');
			res.redirect('manager_partner');
		});
	});
	//行业链接
	app.get('/links', function (req, res) {
		var page = req.query.p ? parseInt(req.query.p) : 1;
		PostLink.getTen(page, function (err, links, total) {
			res.render('links', {
				title: '行业链接-青海聚之源新材料有限公司',
				links: links,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + links.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		})
	});
	//行业链接管理后台
	app.get('/manager_link', checkLogin);
	app.get('/manager_link', function (req, res) {
		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;
		//查询并返回第 page 页的 10 个链接
		PostLink.getTen(page, function (err, links, total) {
			if (err) {
				links = [];
			}
			res.render('manager_link', {
				title: '管理行业链接-青海聚之源新材料有限公司',
				links: links,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + links.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//上传行业链接
	app.get('/post_link', checkLogin);
	app.get('/post_link', function (req, res) {
		res.render('post_link', {
			title: '上传行业链接-青海聚之源新材料有限公司',
			editType: 'new',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/post_link', checkLogin);
	app.post('/post_link', function (req, res) {
		var postLink = new PostLink(req.body.title, req.body.url);
		postLink.save(function (err) {
			if (err) {
				req.flash('error', '发布失败');
				return res.redirect('/post_link');
			}
			req.flash('success', '发布成功!');
			res.redirect('/manager_link');
		});
	});
	//编辑行业链接
	app.get('/edit/link/:id', checkLogin);
	app.get('/edit/link/:id', function (req, res) {
		PostLink.edit(req.params.id, function (err, link) {
			if (err) {
				req.flash('error', err);
				console.log(err);
				return res.redirect('/manager_link');
			}
			console.log(link);
			res.render('post_link', {
				link: link,
				editType: 'edit',
				title: '编辑行业链接-青海聚之源新材料有限公司' ,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});

	});
	app.post('/edit/link/:id', checkLogin);
	app.post('/edit/link/:id', function (req, res) {
		PostLink.update(
			req.params.id,
			req.body.title,
			req.body.url,
			function (err) {
				if (err) {
					console.log('err');
					req.flash('error', err);
					return res.redirect('/manager_link');
				}
				req.flash('success', '修改成功!');
				return res.redirect('/manager_link');
			});
	});
	app.get('/delete/link/:id', checkLogin);
	app.get('/delete/link/:id', function(req, res) {
		PostLink.remove(req.params.id, function (err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			req.flash('success', '删除成功!');
			res.redirect('/manager_link');
		});
	});
	//加入 我们
	app.get('/recruit', function (req, res) {
		PostJob.getAll(function (err, jobs) {
			if (err) {
				jobs = [];
			}
			res.render('recruit', {
				title: '加入我们-青海聚之源新材料有限公司',
				jobs: jobs,
				job: jobs.length > 0 ? jobs[0] : 0,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//获取单个职位信息
	app.get('/job', function (req, res) {
		PostJob.getOne(req.query.jobId, function (err, job){
			if (err) {
				return res.send({
					state: false
				});
			} else {
				return res.send({
					state: true,
					job: job
				});
			}

		})
	});
	//人力资源中心，管理员
	app.get('/manager_job', checkLogin);
	app.get('/manager_job', function (req, res) {
		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;
		// 查询并返回第 page 页的 10 篇文章
		PostJob.getTen(page, function (err, jobs, total) {
			if (err) {
				jobs = [];
			}
			res.render('manager_job', {
				title: '招聘信息管理-青海聚之源新材料有限公司',
				jobs: jobs,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + jobs.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//发布职位
	app.get('/post_job', checkLogin);
	app.get('/post_job', function (req, res) {
		res.render('post_job', {
			title: '发布-青海聚之源新材料有限公司',
			editType: 'new',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	app.post('/post_job', checkLogin);
	app.post('/post_job', function (req, res) {
		var postJob = new PostJob(
			req.body.title,
			req.body.content
		);
		postJob.save(function (err) {
			if (err) {
				req.flash('error', '发布失败');
				return res.redirect('/post_job');
			}
			req.flash('success', '发布成功!');
			res.redirect('/manager_job');
		});
	});
	app.get('/edit/job/:id', checkLogin);
	app.get('/edit/job/:id', function (req, res) {
		PostJob.getOne(req.params.id, function (err, job) {
			if (err) {
				req.flash('error', err);
				console.log(err);
				return res.redirect('/recruit');
			}
			res.render('post_job', {
				title: job.title,
				job: job,
				editType: 'edit',
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});

	});
	//编辑职位
	app.post('/edit/job/:id', checkLogin);
	app.post('/edit/job/:id', function (req, res) {
		PostJob.update(
			req.params.id,
			req.body.title,
			req.body.content, function (err) {
			if (err) {
				console.log('err');
				req.flash('error', err);
				return res.redirect('/manager_job');
			}
			req.flash('success', '修改成功!');
			return res.redirect('/manager_job');
		});
	});
	//删除职位
	app.get('/delete/job/:id', checkLogin);
	app.get('/delete/job/:id', function (req, res) {
		PostJob.remove(req.params.id, function (err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			req.flash('success', '删除成功!');
			res.redirect('recruit');
		});
	});
	//联系我们
	app.get('/contact_us', function (req, res) {
		res.render('contact_us', {
			title: '联系我们|陕西帝奥电梯|中国一线电梯品牌领跑者',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	// //登录
	var user = {
		name: 'admin',
		password: 'qhhx_admin339'
	};
	app.get('/login', checkNotLogin);
	app.get('/login', function (req, res) {
		res.render('login', {
			title: '登录',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()});
	});
	app.post('/login', checkNotLogin);
	app.post('/login', function (req, res) {
		//生成密码的 md5 值

		//var md5 = crypto.createHash('md5'),
		//	password = md5.update(req.body.password).digest('hex');
			//检查用户是否存在
		//User.get(req.body.userName, function (err, user) {
		//	if (!user) {
		//		req.flash('error', '用户不存在!');
		//		return res.redirect('/login');
		//	}
		//	//检查密码是否一致
		//	if (user.password != password) {
		//		req.flash('error', '密码错误!');
		//		console.log('密码不正确');
		//		return res.redirect('/login');
		//	}
		//	//用户名密码都匹配后，将用户信息存入 session
		//	console.log('密码正确');
		//	req.session.user = user;
		//	req.flash('success', '登陆成功!');
		//	return res.redirect('/user_center');
		//});
		if (req.body.userName == user.name && req.body.password == user.password) {
			req.session.user = user;
			req.flash('success', '登陆成功!');
			return res.redirect('/user_center');
		} else {
			req.flash('error', '用户不存在!');
			return res.redirect('/login');
		}

	});
	//发布新闻
	app.get('/post_new', checkLogin);
	app.get('/post_new', function (req, res) {
		res.render('post_new', {
			title: '发布',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	// app.post('/post', checkLogin);
	app.post('/post_new', function (req, res) {
		var post = new PostNew(req.body.newtitle, req.body.newcontent);
		post.save(function (err) {
			if (err) {
				req.flash('error', '发布失败');
				return res.redirect('/post_new');
			}
			req.flash('success', '发布成功!');
			res.render('new_center', {
				title: '新闻中心|陕西帝奥电梯|中国一线电梯品牌领跑者',
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//消息中心
	app.get('/leave_message', checkLogin);
	app.get('/leave_message', function (req, res) {
		//判断是否是第一页，并把请求的页数转换成 number 类型
		var page = req.query.p ? parseInt(req.query.p) : 1;
		// 查询并返回第 page 页的 10 篇文章
		Message.getTen(page, function (err, messs, total) {
			if (err) {
				messs = [];
			}
			res.render('leave_message', {
				title: '人力资源|陕西帝奥电梯|中国一线电梯品牌领跑者',
				messs: messs,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + messs.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//图库
	app.get('/gallery', checkLogin);
	app.get('/gallery', function (req, res) {
		Pic.getAll(function (err, pics) {
			if (err) {
				pics = [];
			}
			console.log(pics);
			res.render('gallery', {
				title: '图库-青海聚之源新材料有限公司',
				pics: pics,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
	//上传图片
	app.post('/gallery/upload', checkLogin);
	app.post('/gallery/upload', function (req, res) {
		var pics = [];
		for (var i in req.files) {
			if (req.files[i].size == 0){
			// 使用同步方式删除一个文件
				fs.unlinkSync(req.files[i].path);
				console.log('Successfully removed an empty file!');
			} else {

				var target_path = './public/images/dbimg/' + req.files[i].name;
			// 使用同步方式重命名一个文件
				fs.renameSync(req.files[i].path, target_path);

				var dbImgUrl = '/images/dbimg/' + req.files[i].name;
				pics.push({
					url: dbImgUrl
				});
			}
		}
		var pic = new Pic(pics);
		pic.save(function (err, url){
			if (err) {
				console.log(err);
				req.flash('error', err);
			}
			req.flash('success', '文件上传成功!');
			return res.send({
				state: true,
				url: pics[0].url
			});
		});
	});
	//用户中心
	app.get('/user_center', checkLogin);
	app.get('/user_center', function (req, res) {
		res.render('user_center', {
			title: '后台中心',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
	//登出
	app.get('/logout', checkLogin);
	app.get('/logout', function (req, res) {
		req.session.user = null;
		req.flash('success', '登出成功!');
		res.redirect('/');//登出成功后跳转到主页
	});
	//	404
	app.use(function (req, res) {
		res.render("404");
	});
	//判断是否登录
	function checkLogin(req, res, next) {
		if (!req.session.user) {
			req.flash('error', '未登录!');
			res.redirect('/login');
			return;
		}
		next();
	}

	function checkNotLogin(req, res, next) {
		if (req.session.user) {
			req.flash('error', '已登录!');
			res.redirect('back');//返回之前的页面
			return;
		}
		next();
	}
};
