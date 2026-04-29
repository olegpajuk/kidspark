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
              <div className="text-8xl mb-4">🍋</div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">
                Run Your Lemonade Stand!
              </h2>
              <p className="text-gray-500 mb-2">
                Buy supplies, set prices, and make profit!
              </p>
              <div className="bg-white rounded-xl p-4 mb-6 text-left w-full max-w-sm">
                <p className="text-sm text-gray-600 mb-2">💡 Remember:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• <strong>Profit = Revenue - Costs</strong></li>
                  <li>• Hot weather = More customers!</li>
                  <li>• Lower prices = More sales</li>
                  <li>• Don&apos;t run out of supplies!</li>
                </ul>
              </div>
              <p className="text-lg font-bold text-yellow-600 mb-4">
                Starting cash: £{game.cash.toFixed(2)}
              </p>
              <button
                onClick={handleStartDay}
                className="px-8 py-4 bg-[#FFE135] text-gray-800 font-bold rounded-2xl text-lg hover:opacity-90 active:scale-95 transition-all shadow-lg"
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

              <div className="space-y-3 mb-4">
                {SUPPLIES.map((supply) => {
                  const cartQty = cart[supply.id] || 0;
                  const inventoryQty = game.inventory[supply.id] || 0;

                  return (
                    <div
                      key={supply.id}
                      className="bg-white rounded-xl p-3 flex items-center gap-3"
                    >
                      <div className="text-3xl">{supply.emoji}</div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm">
                          {supply.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          £{supply.costPerUnit.toFixed(2)} each · Have: {inventoryQty}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRemoveFromCart(supply.id)}
                          disabled={cartQty === 0}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-30"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-bold">{cartQty}</span>
                        <button
                          onClick={() => handleAddToCart(supply.id)}
                          className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center hover:bg-yellow-200"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Cart Total:</span>
                  <span className="font-bold">£{getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cash After:</span>
                  <span className="font-bold text-green-600">
                    £{(game.cash - getCartTotal()).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBuySupplies}
                className="w-full py-4 bg-[#FFE135] text-gray-800 font-bold rounded-2xl text-lg hover:opacity-90 active:scale-95 transition-all"
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

              <div className="bg-white rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-500 mb-2">Cost to make one cup:</p>
                <p className="text-2xl font-black text-gray-800">
                  £{costPerCup.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  You can make up to <strong>{maxCups}</strong> cups
                </p>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                Pick your price per cup:
              </p>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {PRICE_OPTIONS.map((price) => {
                  const profit = price - costPerCup;
                  const isSelected = selectedPrice === price;

                  return (
                    <button
                      key={price}
                      onClick={() => setSelectedPrice(price)}
                      className={`p-3 rounded-xl text-center transition-all ${
                        isSelected
                          ? "bg-yellow-400 ring-2 ring-yellow-600 scale-105"
                          : "bg-white hover:bg-yellow-50"
                      }`}
                    >
                      <p className="font-bold text-gray-800">
                        £{price.toFixed(2)}
                      </p>
                      <p
                        className={`text-xs ${
                          profit > 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {profit > 0 ? "+" : ""}£{profit.toFixed(2)}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="bg-blue-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-blue-700">
                  💡 Lower prices attract more customers, but you earn less per cup.
                  Weather affects demand too!
                </p>
              </div>

              <button
                onClick={handleSetPrice}
                disabled={maxCups === 0}
                className="w-full py-4 bg-[#FFE135] text-gray-800 font-bold rounded-2xl text-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
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
              <div className="text-6xl mb-4">🍋</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Selling Lemonade...
              </h3>
              <div className="flex gap-1 flex-wrap justify-center max-w-xs">
                {Array.from({ length: soldAnimation }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="text-2xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    🥤
                  </motion.span>
                ))}
              </div>
              <p className="text-gray-500 mt-4">
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
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">
                  {currentDayResult.profit > 0 ? "🎉" : "😅"}
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Day {currentDayResult.day} Complete!
                </h3>
              </div>

              <div className="bg-white rounded-xl p-4 mb-4 space-y-3">
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
                <div className="border-t pt-2 flex justify-between text-lg">
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

              <div className="flex gap-2 mb-4">
                {currentDayResult.customersHappy > 0 && (
                  <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-2xl">😊</p>
                    <p className="text-xs text-gray-600">
                      {currentDayResult.customersHappy} happy
                    </p>
                  </div>
                )}
                {currentDayResult.customersSad > 0 && (
                  <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-2xl">😢</p>
                    <p className="text-xs text-gray-600">
                      {currentDayResult.customersSad} turned away
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleNextDay}
                className="w-full py-4 bg-[#FFE135] text-gray-800 font-bold rounded-2xl text-lg hover:opacity-90 active:scale-95 transition-all"
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
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl"
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="text-6xl mb-3">
                {stars === 3 ? "🏆" : stars === 2 ? "🍋" : stars === 1 ? "👍" : "📚"}
              </div>
              <h2 className="text-xl font-black text-gray-800 mb-2">
                {totalProfit > 0 ? "Business Success!" : "Learning Experience!"}
              </h2>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total Cups Sold:</span>
                  <span className="font-bold">{totalCupsSold}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Final Cash:</span>
                  <span className="font-bold">£{game.cash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
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

              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`text-2xl ${s <= stars ? "opacity-100" : "opacity-20"}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={initGame}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-yellow-100 text-yellow-700 font-bold hover:bg-yellow-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  Again
                </button>
                <button
                  onClick={() => router.push("/games/finance")}
                  className="flex-1 py-3 rounded-xl bg-[#FFE135] text-gray-800 font-bold hover:opacity-90"
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
