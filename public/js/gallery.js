$(document).ready(function(){function e(e,i,a){if("undefined"==typeof FormData)throw new Error("FormData is not implemented");for(var t=new XMLHttpRequest,n=new FormData,r=0;r<i.length;r++)n.append("image",i[r]);t.onreadystatechange=function(){4===t.readyState&&a&&a(t)},t.open("POST",e),t.send(n)}var i=$(".gallery__form");$(".btn-post-new").click(function(){return i.is(":visible")?i.hide():i.show(),!1}),$(".submit").click(function(){var a=$(this);if(!a.hasClass("disabled")){a.addClass("disabled");var t=document.getElementById("image").files,n=[],r="/gallery/upload",s=t.length;if(0!==s){for(var d=0;s>d;d++){if(-1===t[d].type.indexOf("image")&&alert("请选择图片文件"),t[d].size>2097152)return void alert("图片尺寸过大！服务器硬盘扛不住！");n.push(t[d])}e(r,n,function(e){if(e=JSON.parse(e.response),e.state){var i='<div class="pic-item"><div class="pic-wrapper"><img src="'+e.url+'" alt="青海聚之源新材料有限公司"></div><div class="pic__url">图片链接：'+e.url+"</div></div>";$(".list").prepend($(i)),a.removeClass("disabled")}}),$(document).click(function(){i.hide()})}}})});