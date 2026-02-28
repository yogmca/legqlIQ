# How to Get Hugging Face API Key (FREE)

## Step-by-Step Guide

### Step 1: Create Hugging Face Account

1. Go to [Hugging Face](https://huggingface.co/)
2. Click **Sign Up** in the top right
3. Fill in:
   - Email address
   - Username
   - Password
4. Verify your email address

### Step 2: Generate Access Token (API Key)

1. After logging in, click your **profile picture** in top right
2. Click **Settings**
3. In the left sidebar, click **Access Tokens**
4. Click **New token** button
5. Fill in:
   - **Name**: LegalIQ Chatbot
   - **Role**: Select **Read** (sufficient for inference)
6. Click **Generate token**
7. **IMPORTANT**: Copy the token immediately (starts with `hf_...`)
   - Example: `hf_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890`
   - You won't be able to see it again!

### Step 3: Save Your API Key

Copy your token and save it somewhere safe. You'll need it in the next step.

Example token format:
```
hf_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890
```

---

## What You Get for FREE

✅ **Unlimited API calls** (rate-limited)
✅ **Access to 100,000+ models**
✅ **No credit card required**
✅ **No expiration**
✅ **Commercial use allowed**

### Rate Limits (Free Tier)
- ~1000 requests per hour
- ~30,000 characters per month
- Perfect for small to medium websites

---

## Next Steps

Once you have your Hugging Face API key:

1. Share it with me (starts with `hf_...`)
2. I'll update the chatbot to use Hugging Face instead of Google Gemini
3. The chatbot will work immediately!

---

## Alternative: Use Inference API Without Token

You can also use Hugging Face models without an API key, but with stricter rate limits:
- ~100 requests per hour
- Public models only
- Good for testing

---

## Recommended Models for Legal Chatbot

Once integrated, we can use these free models:

1. **mistralai/Mistral-7B-Instruct-v0.2** (Recommended)
   - Best for conversational AI
   - Fast responses
   - Good at following instructions

2. **meta-llama/Llama-2-7b-chat-hf**
   - Good for general chat
   - Reliable responses

3. **google/flan-t5-large**
   - Smaller, faster
   - Good for simple questions

---

## Quick Reference

**Hugging Face Website**: https://huggingface.co/
**Sign Up**: https://huggingface.co/join
**Access Tokens**: https://huggingface.co/settings/tokens
**Documentation**: https://huggingface.co/docs/api-inference/

---

## Security Note

⚠️ **Keep your API key secret!**
- Don't commit it to GitHub
- Don't share it publicly
- Store it in `.env` file only
- The `.env` file is already in `.gitignore`

---

## After You Get the Key

Just provide me with your Hugging Face API key (starts with `hf_...`) and I'll:

1. ✅ Update the chatbot controller to use Hugging Face
2. ✅ Install required npm packages
3. ✅ Configure the `.env` file
4. ✅ Test the chatbot
5. ✅ Provide documentation

The chatbot will then work perfectly with FREE AI responses about Indian law!
