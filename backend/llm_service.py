from openai import OpenAI

client = OpenAI()

def extract_contract_data(contract_text):

    prompt = f"""
You are an expert in car lease contract analysis.

Extract the following details from the contract:

- APR (Interest Rate)
- Monthly Payment
- Lease Term (months)
- Mileage Limit
- Early Termination Fee
- Buyout Price

Return the result in JSON format.

Contract Text:
{contract_text}
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content