"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { ColorTag } from "@/app/components/ColorTag";
import type { Product } from "@/lib/types";
import { AddToCartForm, getDefaultColorId } from "./AddToCartForm";

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
  const [colorId, setColorId] = useState(() => getDefaultColorId(product));
  const color =
    product.colors.find((option) => option.id === colorId) ?? product.colors[0];

  return (
    <article className="grid gap-10 md:grid-cols-2 lg:gap-16">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg">
        <Image
          src={product.image}
          alt={product.name}
          width={600}
          height={600}
          className="h-full w-full object-cover"
        />
        <ColorTag color={color} />
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
