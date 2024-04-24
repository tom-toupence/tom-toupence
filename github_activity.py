import requests

def get_github_activity(username, token):
    url = f"https://api.github.com/users/{username}/events"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Erreur {response.status_code}: Impossible de récupérer les données d'activité.")
        return None

def format_activity(activity):
    formatted_activity = "| Type d'événement | Référentiel | Date |\n"
    formatted_activity += "|------------------|-------------|------|\n"
    for event in activity:
        event_type = event['type']
        repo_name = event['repo']['name']
        created_at = event['created_at']
        formatted_activity += f"| {event_type} | {repo_name} | {created_at} |\n"
    return formatted_activity

def main():
    username = "tom-toupence"
    token = "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"
    
    activity = get_github_activity(username, token)
    if activity:
        formatted_activity = format_activity(activity)
        print(formatted_activity)  # Vous pouvez remplacer ceci par l'écriture dans un fichier README

if __name__ == "__main__":
    main()
