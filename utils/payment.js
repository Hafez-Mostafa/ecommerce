import Stripe from "stripe";

export async function payment({stripe = new Stripe(process.env.STRIPE_SEKRET_KEY),
    payment_method_types=["card"],
    mode="payment",
    customer_email,
    success_url,
    cancel_url,
    line_items=[],
    discount=[]
}={}){
    
    stripe = new Stripe(process.env.STRIPE_SEKRET_KEY)
    const session = await stripe.checkout.sessions.create({

        payment_method_types,
            mode,
            customer_email,
            success_url,
            cancel_url,
            line_items,
            discount

      
            

    })
    return session
}

