"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/i18n"

interface CategoryCardProps {
  category: {
    id: string
    name: string
    image: string
  }
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { t } = useLanguage()

  // Map category names to translation keys
  const getCategoryTranslationKey = (name: string) => {
    const map: Record<string, string> = {
      Tours: "tours",
      Culture: "culture",
      "Food & Drink": "food_drink",
      "Hand Crafting": "hand_crafting",
      Nature: "nature",
      Adventure: "adventure",
      "All Categories": "all_categories",
    }
    return map[name] || name.toLowerCase().replace(/\s+/g, "_")
  }

  return (
    <Link href={`/experiences?category=${category.id}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="aspect-square relative">
          <img
            src={category.image || "/placeholder.svg"}
            alt={t(getCategoryTranslationKey(category.name))}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center p-4">
            <h3 className="text-white font-medium text-center">{t(getCategoryTranslationKey(category.name))}</h3>
          </div>
        </div>
      </div>
    </Link>
  )
}
