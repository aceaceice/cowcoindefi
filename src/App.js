import React, { Component } from "react";
import Token from "./contracts/Token.json";
import getWeb3 from "./getWeb3";
import Defi from "./contracts/Defi.json";
import "./App.css";

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    cowCoin: null,
  };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();

      const accounts = await web3.eth.getAccounts();

      const networkId = await web3.eth.net.getId();
      const buba = Token.networks[networkId];
      const defiAddress = Defi.networks[networkId];
      console.log(buba.address);
      const token = new web3.eth.Contract(Token.abi, buba && buba.address);
      const defi = new web3.eth.Contract(
        Defi.abi,
        defiAddress && defiAddress.address
      );
      this.setState(
        { web3, accounts, cowCoin: token, defi, defiAddress },
        this.runExample
      );
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  async deposit(amount) {
    if (this.state.defi !== "undefined") {
      try {
        await this.state.defi.methods
          .deposit()
          .send({ value: amount.toString(), from: this.state.accounts[0] });
      } catch (e) {
        console.log(e);
      }
    }
  }

  async withdraw() {
    if (this.state.defi !== "undefined") {
      try {
        await this.state.defi.methods
          .withdraw()
          .send({ from: this.state.accounts[0] });
      } catch (e) {
        console.log(e);
      }
    }
  }

  async borrow(amount) {
    if (this.state.defi !== "undefined") {
      try {
        await this.state.defi.methods
          .withdraw()
          .send({ value: amount.toString(), from: this.state.accounts[0] });
      } catch (e) {
        console.log(e);
      }
    }
  }

  async payOff() {
    if (this.state.defi !== "undefined") {
      try {
        const collateral = await this.state.defi.methods
          .collateralEther(this.state.accounts[0])
          .call({ from: this.state.accounts[0] });
        const tokenBorrowed = collateral / 2;
        await this.state.token.methods
          .approve(this.state.defiAddress.address, tokenBorrowed.toString())
          .send({ from: this.state.accounts[0] });
        await this.state.defi.methods
          .payOff()
          .send({ from: this.state.accounts[0] });
      } catch (e) {
        console.log(e);
      }
    }
  }

  mintToken = async () => {
    const { accounts, cowCoin } = this.state;
    try {
      await cowCoin.methods
        .mint(accounts[0], 5000000000)
        .send({ from: accounts[0] });
    } catch (e) {
      console.log(e);
    }
  };
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="app">
        <div>
        <a href="https://github.com/aceaceice/cowcoindefi">Github</a>
        </div>
        <h1>Cow bank</h1>
        <h2>Stake your photons to earn COW COINS</h2>
        <p>Deposit photons</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            let amount = this.depositAmount.value;
            amount = amount * 10 ** 18;
            this.deposit(amount);
          }}
        >
          <div className="form-group mr-sm-2">
            <br></br>
            <input
              id="depositAmount"
              step="0.01"
              type="number"
              ref={(input) => {
                this.depositAmount = input;
              }}
              className="form-control form-control-md"
              placeholder="amount..."
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            DEPOSIT
          </button>
        </form>
        <p>Withdraw</p>
        <button
          onClick={() => {
            this.withdraw();
          }}
        >
          WITHDRAW
        </button>
        <p>Borrow </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            let amount = this.borrowAmount.value;
            amount = amount * 10 ** 18;
            this.borrow(amount);
          }}
        >
          <div className="form-group mr-sm-2">
            <input
              id="borrowAmount"
              step="0.01"
              type="number"
              ref={(input) => {
                this.borrowAmount = input;
              }}
              className="form-control form-control-md"
              placeholder="amount..."
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            BORROW
          </button>
        </form>
        <p>Pay off</p>
        <button
          onClick={() => {
            this.payOff();
          }}
        >
          PAYOFF
        </button>
      </div>
    );
  }
}

export default App;
