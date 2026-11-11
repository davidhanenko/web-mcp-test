"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { ColorTag } from "@/app/components/ColorTag";
import type { Product } from "@/lib/types";
import { AddToCartForm } from "./AddToCartForm";

// Image and form share the color, so the image's color tag matches what is bought.
export function ProductView({
  product,
  children,
}: {
  product: Product;
  // Server-rendered tags, title, price and description above the form.
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
