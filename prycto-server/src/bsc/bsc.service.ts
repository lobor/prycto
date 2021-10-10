import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Injectable } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { ExchangeService } from 'src/exchanges/service';
import { UserService } from 'src/user/user.service';
import { JSDOM } from 'jsdom';

// export interface addExchangeParams {
//   _id: string;
//   name: string;
//   exchange: ccxt.ExchangeId;
//   publicKey: string;
//   secretKey: string;
// }

@Injectable()
export class BscService {
  //   private client?: BncClient;

  constructor(
    private readonly appService: AppService,
    private readonly exchangeService: ExchangeService,
  ) {}

  fetch(config: AxiosRequestConfig) {
    return axios.request({
      baseURL: 'https://api.bscscan.com/api/',
      url: '/',
      ...config,
    });
  }

  async getHistory(exchangeId: string, address: string) {
    const exchange = await this.exchangeService.findById(exchangeId);
    const { data } = await this.fetch({
      params: {
        module: 'account',
        action: 'tokentx',
        contractaddress: address,
        address: exchange.address,
        apikey: this.appService.decrypt(exchange.secretKey),
      },
    });
    const buy = [];
    const sell = [];
    let decimal = 2;
    await Promise.all(
      data.result.map(async (transaction) => {
        const { to, from, tokenDecimal } = transaction;
        decimal = Number(tokenDecimal);
        if (to !== '0x000000000000000000000000000000000000dead') {
          if (to.toLowerCase() === exchange.address.toLowerCase()) {
            console.log(
              'buy',
              Number(transaction.value) / Math.pow(10, decimal),
            );
            const { data } = await this.fetch({
              params: {
                module: 'contract',
                action: 'getabi',
                address: from,
                apikey: this.appService.decrypt(exchange.secretKey),
              },
            });
            console.log(JSON.parse(data.result));
            buy.push(transaction);
          } else if (from.toLowerCase() === exchange.address.toLowerCase()) {
            console.log(
              'sell',
              Number(transaction.value) / Math.pow(10, decimal),
            );
            sell.push(transaction);
          }
        }
      }),
    );
    const valueBuy = buy.reduce((acc, { value }) => {
      acc = acc + Number(value);
      return acc;
    }, 0);
    const valueSell = sell.reduce((acc, { value }) => {
      acc = acc + Number(value);
      return acc;
    }, 0);
    console.log(
      valueBuy / Math.pow(10, decimal),
      valueSell / Math.pow(10, decimal),
    );
    console.log((valueBuy - valueSell) / Math.pow(10, decimal));
  }

  async getBalance(exchangeId: string, address: string) {
    const exchange = await this.exchangeService.findById(exchangeId);
    const { data: balanceToken } = await this.fetch({
      params: {
        module: 'account',
        action: 'tokenbalance',
        contractaddress: address,
        address: exchange.address,
        apikey: this.appService.decrypt(exchange.secretKey),
      },
    });

    const { data: html } = await this.fetch({
      url: `https://bscscan.com/token/${address}`,
    });
    const dom = new JSDOM(html);
    const decimal = Number(
      dom.window.document
        .getElementById('ContentPlaceHolder1_trDecimals')
        .getElementsByClassName('col-md-8')[0].innerHTML,
    );
    const symbol = dom.window.document.getElementById(
      'ContentPlaceHolder1_hdnSymbol',
    ).value;
    const balance = Number(balanceToken.result) / Math.pow(10, decimal);
    return { available: balance, symbol };
  }
}
