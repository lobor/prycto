import Binance from 'binance-api-node';
import configJson from '../config';

const binance = Binance({
  apiKey: configJson.get('Api:BINANCE_APIKEY'),
  apiSecret: configJson.get('Api:BINANCE_APISECRET'),
})

// function balance_update(data) {
// 	console.log("Balance Update");
// 	for ( let obj of data.B ) {
// 		let { a:asset, f:available, l:onOrder } = obj;
// 		if ( available == "0.00000000" ) continue;
// 		console.log(asset+"\tavailable: "+available+" ("+onOrder+" on order)");
// 	}
// }
// function execution_update(data) {
// 	let { x:executionType, s:symbol, p:price, q:quantity, S:side, o:orderType, i:orderId, X:orderStatus } = data;
// 	if ( executionType == "NEW" ) {
// 		if ( orderStatus == "REJECTED" ) {
// 			console.log("Order Failed! Reason: "+data.r);
// 		}
// 		console.log(symbol+" "+side+" "+orderType+" ORDER #"+orderId+" ("+orderStatus+")");
// 		console.log("..price: "+price+", quantity: "+quantity);
// 		return;
// 	}
// 	//NEW, CANCELED, REPLACED, REJECTED, TRADE, EXPIRED
// 	console.log(symbol+"\t"+side+" "+executionType+" "+orderType+" ORDER #"+orderId);
// }
// binance.websockets.userData(balance_update, execution_update);
// binance.exchangeInfo((err, values) => {
//   // console.log(values)
// });

export default binance;
