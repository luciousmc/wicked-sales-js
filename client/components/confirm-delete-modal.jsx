import React from 'react';

/**
 * Modal Component to confirm if user wants to remove an item from the cart
 *
 */
function ConfirmDeleteModal({ hideConfirmDeleteModal, removeFromCart, product: { name, productId }, productAmt }) {

  const handleDeleteItemClick = () => {
    removeFromCart(productId);
    hideConfirmDeleteModal();
  };

  const handleCancelClick = () => {
    const qty = document.getElementById('qty');
    qty.value = productAmt;
    hideConfirmDeleteModal();
  };

  return (
    <section className="modal-screen d-flex justify-content-center align-items-center" id="confirm-delete-modal">
      <div className="container confirm-delete-box p-3">
        <div className="row">
          <div className="col">
            <h3 className="text-center text-dark">Are you sure?</h3>
            <hr/>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <p
              className="lead text-center text-sm-left"
            >
              { `Do you want to remove ${productAmt} "${name}" from the cart?` }
            </p>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col text-right">
            <button onClick={ handleDeleteItemClick } className="btn btn-danger mr-3">Delete Item</button>
            <button onClick={ handleCancelClick } className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConfirmDeleteModal;
