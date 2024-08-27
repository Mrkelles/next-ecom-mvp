import { Button } from "@/components/ui/button";
import db from "@/db/db";
import { formatCurrency } from "@/lib/formatters";
import { Elements } from "@stripe/react-stripe-js";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export default async function Successpage({searchParams}: {searchParams: {
    payment_intent:string
}}) {
    const paymentIntent = await stripe.paymentIntents
    .retrieve(searchParams.payment_intent)

    if(paymentIntent.metadata.productId == null ) return notFound()
    
    const product = await db.product.findUnique({where: {id:paymentIntent.metadata.productId}})
    if(product == null ) return notFound()

    const isSuccess = paymentIntent.status === "succeeded"

    return (
        <div className="w-full mx-auto mt-6 p-6 lg:flex lg:items-center lg:justify-center">
            <div className="flex flex-col lg:gap-4 items-center">
            <h1 className="text-4xl font-bold text-center">{isSuccess ? "Success!" : "Error!"}</h1>
                <div className="aspect-video flex-shrink-0 w-2/3 relative">
                    <Image 
                        src={product.imagePath} 
                        fill 
                        alt={product.name}
                        className="object-contain"
                     />
                </div>
                <div className="flex flex-col">
                    <div className="text-lg">
                        {formatCurrency(product.priceInCents /100)}
                    </div>
                    <h1 className="text-2xl font-bold">{product.name}</h1>
                    <div className="line-clamp-3 text-muted-foreground">
                        {product.description}
                    </div>
                    <Button className="mt-4" size="lg" asChild>
                        {isSuccess ? <a>Download</a> : 
                        <Link href={`/products/${product.id}/purchase`}>
                            Try Again
                        </Link>}
                    </Button>
                </div>
            </div>
        </div>
    )
}