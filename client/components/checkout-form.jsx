/* eslint-disable no-console */
import React from 'react';

class CheckoutForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      nameError: '',
      addressLine: '',
      addressError: '',
      city: '',
      cityError: '',
      state: '',
      stateError: '',
      zipcode: '',
      zipcodeError: '',
      creditCard: '',
      creditCardError: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.validateFields = this.validateFields.bind(this);
    this.clearErrors = this.clearErrors.bind(this);
  }

  validateFields(e) {
    const { value, name } = e.target;

    switch (name) {
      case 'name':
        // Must have an input
        if (!value) {
          this.setState({ nameError: 'Name is required' });

          // Name must be at least 5 characters
        } else if (value.length < 5) {
          this.setState({ nameError: 'Please enter at least 5 characters' });
        }
        break;
      case 'addressLine':
        if (!value) {
          this.setState({ addressError: 'Address is required' });
        } else if (value.length < 6) {
          this.setState({ addressError: 'Please enter at least 6 characters for address' });
        }
        break;
      case 'city':
        if (!value) {
          this.setState({ cityError: 'City is required' });
        } else if (value.length < 3) {
          this.setState({ cityError: 'Please enter at least 3 characters for city' });
        }
        break;
      case 'state':
        if (!value) {
          this.setState({ stateError: 'State is required' });
        } else if (!isNaN(value)) {
          this.setState({ stateError: 'Please use 2 letter state code' });
        }
        break;
      case 'zipcode':
        if (!value) {
          this.setState({ zipcodeError: 'Zip is required' });
        } else if (isNaN(value)) {
          this.setState({ zipcodeError: 'Please use 2 letter state code' });
        }
        break;
      case 'creditCard':
        if (!value) {
          this.setState({ creditCardError: 'Credit Card is required' });
        }
    }
    console.log('this just got blurred witH: ', e.target);
  }

  clearErrors(field) {
    switch (field) {
      case 'name':
        this.setState({ nameError: '' });
        break;
      case 'addressLine':
        this.setState({ addressError: '' });
        break;
      case 'city':
        this.setState({ cityError: '' });
        break;
      case 'state':
        this.setState({ stateError: '' });
        break;
      case 'zipcode':
        this.setState({ zipcodeError: '' });
        break;
      case 'creditCard':
        this.setState({ creditCardError: '' });
        break;
    }
  }

  handleChange(e) {
    const { value, name } = e.target;

    this.setState({ [name]: value });
  }

  render() {
    const { total } = this.props;
    const { name, addressLine, city, state, zipcode, creditCard } = this.state;
    const { nameError, addressError, cityError, stateError, zipcodeError, creditCardError } = this.state;

    return (
      <section className="container w-50 checkout-container">
        <div className="row">
          <div className="col-6">
            <h1>Checkout</h1>
          </div>
          <div className="col-6">
            <p className="lead mb-0 text-right p-3">{ 'Total Cost: $' + (total / 100).toFixed(2) }</p>
          </div>
          <hr/>
        </div>

        <div className="row">
          <div className="col">
            <hr/>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <form onSubmit={ () => this.props.placeOrder(this.state)}>
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input
                  name="name"
                  type="text"
                  className="form-control"
                  id="name"
                  onChange={ this.handleChange }
                  onBlur={ this.validateFields }
                  onFocus={ () => this.clearErrors('name') }
                  value={ name }
                  maxLength="65"
                  required
                />
                <div className="name-error">
                  { nameError && nameError }
                </div>
              </div>

              <div className="form-group mb-3">
                <label htmlFor="address">Address:</label>
                <input
                  name="addressLine"
                  type="text"
                  className="form-control"
                  id="address"
                  onChange={ this.handleChange }
                  onBlur={ this.validateFields }
                  onFocus={ () => this.clearErrors('addressLine') }
                  value={ addressLine }
                  required
                />
                <div className="address-error">
                  { addressError && addressError }
                </div>
                <div className="address-details d-flex justify-content-between mt-3">
                  <div className="city">
                    <label htmlFor="city">City:</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      onChange={ this.handleChange }
                      onBlur={ this.validateFields }
                      onFocus={ () => this.clearErrors('city') }
                      value={ city }
                      required
                    />
                    <div className="city-error">
                      { cityError && cityError }
                    </div>
                  </div>
                  <div className="state">
                    <label htmlFor="city">State:</label>
                    <input
                      type="text"
                      name="state"
                      className="form-control"
                      onChange={ this.handleChange }
                      onBlur={ this.validateFields }
                      onFocus={ () => this.clearErrors('state') }
                      value={ state }
                      maxLength="2"
                      required
                    />
                    <div className="state-error">
                      { stateError && stateError }
                    </div>
                  </div>
                  <div className="zipcode">
                    <label htmlFor="city">Zip:</label>
                    <input
                      type="text"
                      name="zipcode"
                      className="form-control"
                      onChange={ this.handleChange }
                      onBlur={ this.validateFields }
                      onFocus={ () => this.clearErrors('zipcode') }
                      value={ zipcode }
                      required
                    />
                    <div className="zipcode-error">
                      { zipcodeError && zipcodeError }
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="credit-card">Credit Card Number:</label>
                <input
                  name="creditCard"
                  type="text"
                  className="form-control"
                  id="credit-card"
                  onChange={ this.handleChange }
                  onBlur={ this.validateFields }
                  onFocus={ () => this.clearErrors('creditCard') }
                  value={ creditCard }
                  required
                />
                <div className="credit-card-error">
                  { creditCardError && creditCardError }
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Purchase</button>
            </form>
          </div>
        </div>

        <div className="row">
          <div className="col-12 p-3">
            <a href="" onClick={ () => this.props.setView('catalog', {}) }>
              &lt; Continue Shopping
            </a>
          </div>
        </div>
      </section>
    );
  }
}

export default CheckoutForm;
