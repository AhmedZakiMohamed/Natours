/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
export const bookTour = async (tourId) => {
    try{
  //1)Get checkout session from API
  const session = await axios(
    `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
  );
  //2)Create checkout form + charge the customer
  await stripe.redirectToCheckout({
    sessionId: session.data.session.id,
  });

    }catch(err){
        console.log(err);
        showAlert('error', err);
    }
};
