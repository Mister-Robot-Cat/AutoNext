# 🚀 Future Project Ideas for @Mister-Robot-Cat

This document outlines upcoming project concepts that the GitHub Growth Agent will develop to expand the open-source portfolio of `@Mister-Robot-Cat` with high-value engineering contributions.

## 1. aiogram-testkit (Python)
**Description:** A library for offline testing of Telegram bots built on `aiogram 3` using `pytest`.
- **Core Features:** Fake `Bot` and `Dispatcher` instances, routing updates (messages, callback queries) through handlers, asserting bot responses and FSM states, custom `pytest` fixtures.
- **MVP Milestone:** Implement `send_message()`, `click_button()`, `assert_reply()`, and `assert_state()`.
- **Market Niche:** Very few active, high-quality testing kits exist for the latest `aiogram 3` framework (only one live alternative with ~5 stars).

## 2. pos-core (TypeScript)
**Description:** A dependency-free, headless core engine for Point-of-Sale (POS) systems, decoupled from UI.
- **Core Features:** Shopping cart logic, item modifiers (e.g., sizes, add-ons), discount engine (percentages, fixed amounts, promo codes), tax calculations, robust monetary math using minor units (to avoid floating-point inaccuracies), split payments, and receipt JSON serialization.
- **Motivation:** Extracting the shared domain logic from existing/planned POS applications (like coffee-pos and flower-pos) into a heavily tested, reusable package.

## 3. az-text (Python)
**Description:** Essential utilities for processing Azerbaijani text.
- **Core Features:** Cyrillic to Latin transliteration; SEO-friendly `slugify` that correctly handles `ə ğ ı ö ü ç ş`; linguistically accurate `upper()` and `lower()` functions specifically for `I/ı` and `İ/i` (which standard Python `str.upper()` fails on); and converting numerical amounts to written Azerbaijani words (e.g., for currency/manats).
- **Market Niche:** Current alternatives are extremely sparse, with only one old package (`azconvert` with ~3 stars) and an outdated slugifier from 2018.
