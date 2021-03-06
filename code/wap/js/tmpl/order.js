var getorderurl = "/orders/settlement";
var delorderurl = "/orders/delOrder";
var addorderurl = "/orders/addOrder";
var buyorderurl = "/orders/buytlement";
var buyaddorderurl = "/orders/buy";

function buyorder(callback) {
	getcallback = callback || getcallback;
	data = {
		key:key,
		id:get('goods_id'),
		num:get('goods_num')
	}
	url = ApiUrl+buyorderurl;
	getdata(url,data,getcallback);
}

function getorder(callback) {
	getcallback = callback || getcallback;
	data = {
		key:key,
		id:get('id')
	}
	url = ApiUrl+getorderurl;
	getdata(url,data,getcallback);
}

function addorder(goods_id, coupon_id, address_id,order_message, callback) {
	addcallback = callback || addcallback;
	data = {
		key:key,
		id:goods_id,
		coupon_id:coupon_id,
		address_id:address_id,
		order_message:order_message
	}
	url = ApiUrl+addorderurl;
	getdata(url,data,addcallback);
}

function buyaddorder(goods_id, goods_num, coupon_id, address_id,order_message, callback) {
	addcallback = callback || addcallback;
	data = {
		key:key,
		id:goods_id,
		num:goods_num,
		coupon_id:coupon_id,
		address_id:address_id,
		order_message:order_message
	}
	url = ApiUrl+buyaddorderurl;
	getdata(url,data,addcallback);
}

function delorder(cart_id, uid, callback) {
	delcallback = callback || delcallback;
	data = {
		key:key,
		id:cart_id,
		member_uid:uid
	}
	url = ApiUrl+delbasketurl;
	getdata(url,data,delcallback);
}

function getcallback(info) {
	console.log(info);
	if(info['code']){
		$('.no-order').show();
		//shopdz_alert(info['msg']);
		return ;
	}
	//判断是否有收货地址
	if(info['data']['address'].length < 1){
		/* 显示新建收货地址 */
		$('#editaddress_id').val('');
		$('.address-edit-page').show();
		$('#head_tit').html('新建地址');
		$('.cancelbtn2,.surebtn2').hide();
		$('.address-foot').append('<span class="surebtn2" style="width:100%;" id="newsurebtn2">保存</span>');
		/* 获取省级列表 */
		getarea(0,0);
		$('#city').html('<option value="0" selected>请选择市</option>');
		$('#area').html('<option value="0" selected>请选择区</option>');
		/* 提交收货地址事件 */
		$('#newsurebtn2').click(function(){
			var result = judgeaddress($("#address-name"),$("#address-phone"),$("#address-word"),$('#province'),$('#city'),$('#area'));
			if(result){
				var data = {
					key:key,
					true_name:$('#address-name').val(),
					province_id:$('#province').find('option:selected').val(),
					city_id:$('#city').find('option:selected').val(),
					area_id:$('#area').find('option:selected').val(),
					area_info:$('#province').find('option:selected').html() + ' '
							+ $('#city').find('option:selected').html() + ' '
							+ $('#area').find('option:selected').html(),
					address:$('#address-word').val(),
					tel_phone:$('#address-phone').val(),
					is_default:$('#default').attr('checked')?1:0
				};
				if(data['is_default'] == 1){
					isdefault = true;
					$('.default').remove();
				}
				$.ajax({
					type: 'POST',
					url: ApiUrl + addaddressurl,
					data: data,
					success: function(mes){
						data['address_id'] = mes['data'];
						info['data']['address'][0] = data;
						$('.cancelbtn2,.surebtn2').show();
						$('.address-edit-page').hide();
						settlementaddressadd(info);
						$('#head_tit').html($('title').text());
					},
					dataType: 'json',
					async:false
				});
			}
		})
	}else{
		settlementaddressadd(info);
	}
	
}

function settlementaddressadd(info){
	memberdata = info['data']['address'][0];
	var html = template('ordercontent', info);
	$('#order').prepend(html);
	initPage();
	//判断是否有商品
	if(info['data']['goodsinfo'].length < 1){
		goods = false;
		$('#payment').addClass('bg');
	}
	
	//判断是否商品有货
	for (var i in info['data']['goodsinfo']) {
		if(!info['data']['goodsinfo'][i]['goods_has']){
			goods = false;
			$('#payment').addClass('bg');
		}
	};
	//商品总价
	var sumprice = 0;
	$('.goodsum').each(function(){
		var price = $(this).html();
		if(isNaN(price)){
			price = 0;
		}
		sumprice += parseFloat(price);
		$(this).html(returnFloat(price));
		$(this).parent().siblings().find('.goodsprice').html(returnFloat($(this).parent().siblings().find('.goodsprice').html()));

	})
	$('#sumprice').html(sumprice);
	//实收价格
	realprice();
}

function addcallback(info) {
	if(!info['code']){
		if(!info['data']['code']){
			// var conf = getwebConf('payment');
			// var wx = isWeiXin();
			// if(wx){
			// 	if(conf.wx =='0'){
			// 		shopdz_alert('暂未开通微信支付',0,function(){
			// 			window.location.href = WapSiteUrl + '/index.html';
			// 		});
			// 	}else{
			// 		window.location.href = ApiUrl + '/Payment/routepay?payment_code=wx&pay_sn='+info['data']['order_sn'];
			// 	}
			// }else{
				window.location.href = "./pay.html?order_sn="+info['data']['order_sn'];
			//}
		}else{
			shopdz_alert(info['data']['code']);
		}
	}else{
		shopdz_alert(info['msg']);
	}
}

function delcallback(info) {

}
//商品实收总价
function realprice(){
	//商品总价
	var goodsum = parseFloat($('#sumprice').html());
	$('#sumprice').html(returnFloat(goodsum));
	if(isNaN(goodsum)){
		goodsum = 0;
	}
	//运送费用
	var freight = parseFloat($('#freight').html());
	$('#freight').html(returnFloat(freight));
	if(isNaN(freight)){
		freight = 0;
	}
	//判断是是否免邮，或者差多少钱免邮
	var freeshipping = $('#freight').prev().children('span');
	if(freight == 0 || goodsum*100 >= parseFloat(freeshipping.attr('free'))*100 ){
		freeshipping.html('（免邮）');
		freight = 0;
	} else {
		freeshipping.html('（再购买' + returnFloat((parseFloat(freeshipping.attr('free'))*100 - goodsum*100)/100) + '元免邮)')
	}
	//优惠金额
	var discount = parseFloat($('#discount').html());
	$('#discount').html(returnFloat(discount));
	if(isNaN(discount)){
		discount = 0;
	}
	//判断优惠后金额
	var sum = goodsum - discount;
	if(sum<0){
		sum = 0;
	}
	$('#realprice').html(returnFloat(sum + freight));
}