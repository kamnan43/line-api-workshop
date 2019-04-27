import React, { Component } from 'react';
import liffHelper from '../utils/liffHelper';
import rp from 'request-promise';
import moment from 'moment';

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lineProfile: {},
    }
    liffHelper.getProfile()
      .then(profile => {
        this.setState({ profile });
      });
  }

  sendOrderSummary() {
    return new Promise((resolve, reject) => {
      if (this.state.lineProfile.userId) {
        let orders = this.getOrder();
        let message = [this.createOrderMessage(orders)];
        return window.liff.sendMessages(message);
      } else {
        resolve();
      }
    });
  }

  startLinePayment(total) {
    return this.makeLinePaymentRequest(total)
      .then(() => {
        this.sendOrderSummary();
      }).then(() => {
        window.liff.closeWindow();
      });
  }

  makeLinePaymentRequest(total) {
    return new Promise((resolve, reject) => {
      let orders = [
        {
          name:'ข้าวมันไก่',
          qty: 2,
          price: 45,
        },
        {
          name:'ข้าวขาหมู',
          qty: 1,
          price: 45,
        },
        {
          name:'น้ำแข็ง',
          qty: 3,
          price: 1,
        }
      ];
      let userId = this.state.lineProfile.userId;
      let body = {
        productName: 'LINEPAY DEMO SHOP',
        amount: total,
        orderId: moment().format('x'),
        orders,
        userId,
      };

      return rp({
        method: 'POST',
        uri: `https://us-central1-sitthi-linepay-demo.cloudfunctions.net/reservePayment`,
        body: body,
        json: true,
      }).then((response) => {
        console.log('response', response);
        if (response.returnCode === '0000') {
          const paymentUrl = response.info.paymentUrl.web;
          window.liff.openWindow({
            url: paymentUrl,
            external: true
          });
          resolve(response);
        } else {
          console.log('response.returnCode', response.returnCode);
          reject(new Error(response.returnCode));
        }
      }).catch(function (err) {
        console.log('err', err);
        reject(err);
      });
    });
  }

  render() {
    return (
      <div className="page-content">
        <div className="col-lg-3" />
        <div className="col-lg-6">
          <div>
            <h4>รายการที่สั่ง</h4>
            <div className="row" key={0}>
              <div className="col-xs-6">รายการ</div>
              <div className="col-xs-3 text-right">ราคา</div>
              <div className="col-xs-3 text-right">รวม</div>
            </div>
            <hr />
            <div className="row" key={1}>
              <div className="col-xs-6">ข้าวมันไก่ (2)</div>
              <div className="col-xs-3 text-right">45</div>
              <div className="col-xs-3 text-right">90 บาท</div>
            </div>
            <div className="row" key={1}>
              <div className="col-xs-6">ข้าวขาหมู (1)</div>
              <div className="col-xs-3 text-right">45</div>
              <div className="col-xs-3 text-right">45 บาท</div>
            </div>
            <div className="row" key={1}>
              <div className="col-xs-6">น้ำแข็ง (3)</div>
              <div className="col-xs-3 text-right">1</div>
              <div className="col-xs-3 text-right">3 บาท</div>
            </div>
            <hr />
            <div className="row" key='count'>
              <div className="col-xs-6">รวม 3 รายการ</div>
              <div className="col-xs-3">-</div>
              <div className="col-xs-3 text-right">138 บาท</div>
            </div>
            <hr />
            <div className="row text-center">
              <span>ชำระเงิน</span>
            </div>
            <div className="row text-center">
              <div className="col-xs-3">&nbsp;</div>
              <div className="col-xs-6">
                <button
                  className="btn btn-default"
                  onClick={this.startLinePayment.bind(this, 138)} >
                  <img src="./images/lp.png" width="100%" alt="linepay" />
                </button>
              </div>
              <div className="col-xs-3">&nbsp;</div>
            </div>
            <br />
          </div>
          <hr />
          <button type="button" className="btn btn-default" onClick={() => { liffHelper.closeWindow() }}>Close LIFF</button>
        </div>
        <div className="col-lg-3" />
      </div>
    );
  }
}