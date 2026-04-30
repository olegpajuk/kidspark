"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, RotateCcw, Plus, Minus, ShoppingCart } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import {
  SUPPLIES,
  initializeLemonadeGame,
  calculateCostPerCup,
  calculateMaxCups,
  simulateDay,
  getRandomWeather,
  type LemonadeGameState,
  type DayResult,
} from "@/lib/data/finance/lemonade-stand";
import type { DifficultyTier } from "@/types/game";

interface Props {
  difficulty: DifficultyTier;
}

type GamePhase = "intro" | "buy" | "price" | "selling" | "results" | "complete";

const PRICE_OPTIONS = [0.50, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00, 2.50];

export function LemonadeStand({ difficulty }: Props) {
  const router = useRouter();
  const { playSound } = useAudio();

  const [game, setGame] = useState<LemonadeGameState | null>(null);
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedPrice, setSelectedPrice] = useState(1.00);
  const [currentDayResult, setCurrentDayResult] = useState<DayResult | null>(null);
  const [soldAnimation, setSoldAnimation] = useState(0);

  const initGame = useCallback(() => {
    const newGame = initializeLemonadeGame(difficulty);
    setGame(newGame);
    setPhase("intro");
    setCart({});
    setSelectedPrice(1.00);
    setCurrentDayResult(null);
    setSoldAnimation(0);
  }, [difficulty]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleStartDay = () => {
    setPhase("buy");
    playSound("pop");
  };

  const handleAddToCart = (supplyId: string) => {
    if (!game) return;
    const supply = SUPPLIES.find((s) => s.id === supplyId);
    if (!supply) return;

    const currentQty = cart[supplyId] || 0;
    const totalCartCost = SUPPLIES.reduce((sum, s) => {
      const qty = s.id === supplyId ? currentQty + 1 : (cart[s.id] || 0);
      return sum + s.costPerUnit * qty;
    }, 0);

    if (totalCartCost <= game.cash) {
      setCart((prev) => ({ ...prev, [supplyId]: currentQty + 1 }));
      playSound("pop");
    }
  };

  const handleRemoveFromCart = (supplyId: string) => {
    const currentQty = cart[supplyId] || 0;
    if (currentQty > 0) {
      setCart((prev) => ({ ...prev, [supplyId]: currentQty - 1 }));
    }
  };

  const getCartTotal = () => {
    return SUPPLIES.reduce((sum, supply) => {
      return sum + supply.costPerUnit * (cart[supply.id] || 0);
    }, 0);
  };

  const handleBuySupplies = () => {
    if (!game) return;

    const cost = getCartTotal();
    const newInventory = { ...game.inventory };
    
    Object.entries(cart).forEach(([id, qty]) => {
      newInventory[id] = (newInventory[id] || 0) + qty;
    });

    setGame({
      ...game,
      cash: game.cash - cost,
      inventory: newInventory,
    });
    setCart({});
    setPhase("price");
    playSound("correct");
  };

  const handleSetPrice = () => {
    if (!game) return;
    setGame({ ...game, pricePerCup: selectedPrice });
    setPhase("selling");
    
    const maxCups = calculateMaxCups(game.inventory);
    const result = simulateDay(selectedPrice, maxCups, game.weather, difficulty);
    
    const supplyCost = calculateCostPerCup() * result.sold;
    const revenue = selectedPrice * result.sold;
    const profit = revenue - supplyCost;

    const dayResult: DayResult = {
      day: game.day,
      weather: game.weather,
      pricePerCup: selectedPrice,
      supplyCost: Math.round(supplyCost * 100) / 100,
      cupsSold: result.sold,
      revenue: Math.round(revenue * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      customersHappy: result.happy,
      customersSad: result.sad,
    };

    setCurrentDayResult(dayResult);
    setSoldAnimation(0);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setSoldAnimation(count);
      if (count >= result.sold) {
        clearInterval(interval);
        setTimeout(() => {
          setPhase("results");
        }, 500);
      }
    }, 200);

    const newInventory = { ...game.inventory };
    SUPPLIES.forEach((supply) => {
      newInventory[supply.id] -= supply.unitsPerCup * result.sold;
    });

    setGame({
      ...game,
      cash: game.cash + revenue,
      inventory: newInventory,
      dayResults: [...game.dayResults, dayResult],
    });
  };

  const handleNextDay = () => {
    if (!game) return;

    if (game.day >= game.totalDays) {
      setPhase("complete");
      playSound("fanfare");
    } else {
      setGame({
        ...game,
        day: game.day + 1,
        weather: getRandomWeather(),
      });
      setPhase("buy");
      setCurrentDayResult(null);
    }
  };

  if (!game) return null;

  const maxCups = calculateMaxCups(game.inventory);
  const costPerCup = calculateCostPerCup();
  const totalProfit = game.dayResults.reduce((sum, r) => sum + r.profit, 0);
  const totalCupsSold = game.dayResults.reduce((sum, r) => sum + r.cupsSold, 0);
  const stars = totalProfit >= 15 ? 3 : totalProfit >= 8 ? 2 : totalProfit > 0 ? 1 : 0;

  return (
    <div className="min-h-screen bg-[#FFFDE7] flex flex-col">
      {/* Header */}
      <div className="bg-[#FFE135] text-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push("/games/finance")}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="text-center">
          <p className="font-bold text-sm">🍋 Lemonade Stand</p>
          <p className="text-gray-600 text-xs">
            Day {game.day}/{game.totalDays}
          </p>
        </div>
        <div className="text-sm font-bold bg-white/50 px-3 py-1 rounded-full">
          £{game.cash.toFixed(2)}
        </div>
      </div>

      {/* Weather Bar */}
      {phase !== "intro" && phase !== "complete" && (
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-gray-500">Today&apos;s weather:</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{game.weather.emoji}</span>
            <span className="font-bold text-gray-800">{game.weather.name}</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Intro Phase */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              className="flex-1 flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-6xl mb-3">🍋</div>
              <h2 className="text-xl font-black text-gray-800 mb-1">
                Run Your Lemonade Stand!
              </h2>
              <p className="text-gray-500 text-sm mb-2">
                Buy supplies, set prices, and make profit!
              </p>
              <div className="bg-white rounded-xl p-3 mb-4 text-left w-full max-w-sm">
                <p className="text-xs text-gray-600 mb-1">💡 Remember:</p>
                <ul className="text-[10px] text-gray-500 space-y-0.5">
                  <li>• <strong>Profit = Revenue - Costs</strong></li>
                  <li>• Hot weather = More customers!</li>
                  <li>• Lower prices = More sales</li>
                  <li>• Don&apos;t run out of supplies!</li>
                </ul>
              </div>
              <p className="text-sm font-bold text-yellow-600 mb-3">
                Starting cash: £{game.cash.toFixed(2)}
              </p>
              <button
                onClick={handleStartDay}
                className="px-6 py-3 bg-[#FFE135] text-gray-800 font-bold rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg"
              >
                Start Day 1! 🚀
              </button>
            </motion.div>
          )}

          {/* Buy Phase */}
          {phase === "buy" && (
            <motion.div
              key="buy"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Buy Supplies
              </h3>

              <div className="space-y-2 mb-3">
                {SUPPLIES.map((supply) => {
                  const cartQty = cart[supply.id] || 0;
                  const inventoryQty = game.inventory[supply.id] || 0;

                  return (
                    <div
                      key={supply.id}
                      className="bg-white rounded-lg p-2 flex items-center gap-2"
                    >
                      <div className="text-2xl">{supply.emoji}</div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-xs">
                          {supply.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          £{supply.costPerUnit.toFixed(2)} · Have: {inventoryQty}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRemoveFromCart(supply.id)}
                          disabled={cartQty === 0}
                          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center font-bold text-sm">{cartQty}</span>
                        <button
                          onClick={() => handleAddToCart(supply.id)}
                          className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center hover:bg-yellow-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-gray-600">Cart Total:</span>
                  <span className="font-bold">£{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Cash After:</span>
                  <span className="font-bold text-green-600">
                    £{(game.cash - getCartTotal()).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBuySupplies}
                className="w-full py-3 bg-[#FFE135] text-gray-800 font-bold rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all"
              >
                {getCartTotal() > 0 ? "Buy Supplies" : "Skip Buying"} →
              </button>
            </motion.div>
          )}

          {/* Price Phase */}
          {phase === "price" && (
            <motion.div
              key="price"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                💰 Set Your Price
              </h3>

              <div className="bg-white rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-500 mb-1">Cost to make one cup:</p>
                <p className="text-xl font-black text-gray-800">
                  £{costPerCup.toFixed(2)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  You can make up to <strong>{maxCups}</strong> cups
                </p>
              </div>

              <p className="text-xs text-gray-600 mb-2">
                Pick your price per cup:
              </p>

              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {PRICE_OPTIONS.map((price) => {
                  const profit = price - costPerCup;
                  const isSelected = selectedPrice === price;

                  return (
                    <button
                      key={price}
                      onClick={() => setSelectedPrice(price)}
                      className={`p-2 rounded-lg text-center transition-all ${
                        isSelected
                          ? "bg-yellow-400 ring-2 ring-yellow-600 scale-105"
                          : "bg-white hover:bg-yellow-50"
                      }`}
                    >
                      <p className="font-bold text-gray-800 text-xs">
                        £{price.toFixed(2)}
                      </p>
                      <p
                        className={`text-[10px] ${
                          profit > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {profit > 0 ? "+" : ""}£{profit.toFixed(2)}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="bg-blue-50 rounded-lg p-2 mb-3">
                <p className="text-[10px] text-blue-700">
                  💡 Lower prices attract more customers, but you earn less per cup.
                </p>
              </div>

              <button
                onClick={handleSetPrice}
                disabled={maxCups === 0}
                className="w-full py-3 bg-[#FFE135] text-gray-800 font-bold rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
              >
                {maxCups === 0 ? "No Supplies!" : "Open Stand! 🍋"}
              </button>
            </motion.div>
          )}

          {/* Selling Phase */}
          {phase === "selling" && currentDayResult && (
            <motion.div
              key="selling"
              className="flex-1 flex flex-col items-center justify-center text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-5xl mb-3">🍋</div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Selling Lemonade...
              </h3>
              <div className="flex gap-0.5 flex-wrap justify-center max-w-xs">
                {Array.from({ length: soldAnimation }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="text-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    🥤
                  </motion.span>
                ))}
              </div>
              <p className="text-gray-500 mt-3 text-sm">
                {soldAnimation} cups sold so far...
              </p>
            </motion.div>
          )}

          {/* Results Phase */}
          {phase === "results" && currentDayResult && (
            <motion.div
              key="results"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-3">
                <div className="text-4xl mb-1">
                  {currentDayResult.profit > 0 ? "🎉" : "😅"}
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Day {currentDayResult.day} Complete!
                </h3>
              </div>

              <div className="bg-white rounded-lg p-3 mb-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Cups Sold:</span>
                  <span className="font-bold">{currentDayResult.cupsSold} 🥤</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per cup:</span>
                  <span className="font-bold">
                    £{currentDayResult.pricePerCup.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Revenue:</span>
                  <span className="font-bold">
                    +£{currentDayResult.revenue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-red-500">
                  <span>Supply Costs:</span>
                  <span className="font-bold">
                    -£{currentDayResult.supplyCost.toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-1.5 flex justify-between text-base">
                  <span className="font-bold">Profit:</span>
                  <span
                    className={`font-black ${
                      currentDayResult.profit >= 0
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {currentDayResult.profit >= 0 ? "+" : ""}£
                    {currentDayResult.profit.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                {currentDayResult.customersHappy > 0 && (
                  <div className="flex-1 bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-xl">😊</p>
                    <p className="text-[10px] text-gray-600">
                      {currentDayResult.customersHappy} happy
                    </p>
                  </div>
                )}
                {currentDayResult.customersSad > 0 && (
                  <div className="flex-1 bg-red-50 rounded-lg p-2 text-center">
                    <p className="text-xl">😢</p>
                    <p className="text-[10px] text-gray-600">
                      {currentDayResult.customersSad} turned away
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleNextDay}
                className="w-full py-3 bg-[#FFE135] text-gray-800 font-bold rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all"
              >
                {game.day >= game.totalDays ? "See Final Results" : "Next Day →"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Complete Overlay */}
      <AnimatePresence>
        {phase === "complete" && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-4 w-full max-w-sm text-center shadow-2xl"
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="text-5xl mb-2">
                {stars === 3 ? "🏆" : stars === 2 ? "🍋" : stars === 1 ? "👍" : "📚"}
              </div>
              <h2 className="text-lg font-black text-gray-800 mb-2">
                {totalProfit > 0 ? "Business Success!" : "Learning Experience!"}
              </h2>

              <div className="bg-gray-50 rounded-lg p-3 mb-3 text-xs">
                <div className="flex justify-between mb-1.5">
                  <span className="text-gray-600">Total Cups Sold:</span>
                  <span className="font-bold">{totalCupsSold}</span>
                </div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-gray-600">Final Cash:</span>
                  <span className="font-bold">£{game.cash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-1.5">
                  <span className="text-gray-600">Total Profit:</span>
                  <span
                    className={`font-black ${
                      totalProfit >= 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {totalProfit >= 0 ? "+" : ""}£{totalProfit.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-1.5 mb-3">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`text-xl ${s <= stars ? "opacity-100" : "opacity-20"}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={initGame}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-yellow-100 text-yellow-700 font-bold text-sm hover:bg-yellow-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Again
                </button>
                <button
                  onClick={() => router.push("/games/finance")}
                  className="flex-1 py-2.5 rounded-lg bg-[#FFE135] text-gray-800 font-bold text-sm hover:opacity-90"
                >
                  Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
