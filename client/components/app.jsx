import React, { Component } from 'react';
import Header from './header';
import ProductList from './product-list';
import ProductDetails from './product-details';
import CartSummary from './cart-summary';
import CheckoutForm from './checkout-form';
import DisclaimerModal from './disclaimer';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstVisit: true,
      view: {
        name: 'catalog',
        params: {}
      },
      cart: []
    };
    this.setView = this.setView.bind(this);
    this.setVisit = this.setVisit.bind(this);
    this.addToCart = this.addToCart.bind(this);
    this.placeOrder = this.placeOrder.bind(this);
  }

  componentDidMount() {
    this.getCartItems();
  }

  getCartItems() {
    fetch('/api/cart')
      .then(response => response.json())
      .then(cartItems => {
        this.setState({ cart: cartItems });
      });
  }

  setVisit() {
    this.setState({ firstVisit: false });
  }

  addToCart(product) {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    };

    fetch('/api/cart', fetchOptions)
      .then(response => response.json())
      .then(item => {
        this.setState({ cart: [...this.state.cart, item] });
      })
      .catch(error => console.error(error));
  }

  placeOrder(customer) {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customer)
    };

    fetch('/api/orders', fetchOptions)
      .then(() => {
        this.setState({
          view: {
            name: 'catalog',
            params: {}
          },
          cart: []
        });
      });
  }

  setView(name, params) {
    this.setState({ view: { name, params } });
  }

  render() {
    let renderView;
    const overflow = this.state.firstVisit ? 'no-scroll' : 'scroll';

    if (this.state.view.name === 'catalog') {
      renderView = <ProductList setView={ this.setView } />;
    } else if (this.state.view.name === 'details') {
      renderView = (
        <ProductDetails
          params={ this.state.view.params }
          setView={ this.setView }
          addToCart={ this.addToCart }
        />);
    } else if (this.state.view.name === 'cart') {
      renderView = <CartSummary list={ this.state.cart } setView={ this.setView } />;
    } else {
      renderView = (
        <CheckoutForm
          setView={ this.setView }
          placeOrder={ this.placeOrder }
          total={ this.state.view.params.total }
        />
      );
    }
    return (
      <div className={ 'pb-5 ' + overflow }>
        { this.state.firstVisit
          ? <DisclaimerModal firstVisit={ this.state.firstVisit } setVisit={ this.setVisit } />
          : ''
        }
        <Header cartItemAmt={ this.state.cart.length } setView={ this.setView } />
        { renderView }
      </div>
    );
  }
}

export default App;
