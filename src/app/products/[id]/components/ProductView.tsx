"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { ColorTag } from "@/app/components/ColorTag";
import type { Product } from "@/lib/types";
import { AddToCartForm } from "./AddToCartForm";

/**
 * Image + purchase form. They share the selected color, so the color tag on the
 * image always matches the color the shopper is about to buy.
 */
export function ProductView({
  product,
  children,
}: {
  product: Product;
  /** Server-rendered details (tags, title, price, description) shown above the form. */
  children: ReactNode;
}) {
  const [colorId, setColorId] = useState("");
  const color = product.colors.find((option) => option.id === colorId);

  return (
    <article className="grid items-start gap-6 md:grid-cols-2 lg:gap-10">
      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-lg">
        <Image
          src={product.image}
          alt={product.name}
          width={600}
          height={600}
          className="h-full w-full object-cover"
        />
        {color ? <ColorTag color={color} /> : null}
      </div>
      <div className="max-w-xl">
        {children}
        <AddToCartForm
          product={product}
          colorId={colorId}
          onColorChange={setColorId}
        />
      </div>
    </article>
  );
}
