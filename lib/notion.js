async function syncRegistrationToNotion(registration) {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATA_SOURCE_ID) {
    return { skipped: true };
  }

  const properties = {
    Nome: {
      title: [
        {
          text: {
            content: registration.person.name || registration.code
          }
        }
      ]
    },
    Codigo: {
      rich_text: [
        {
          text: {
            content: registration.code
          }
        }
      ]
    },
    Telefone: {
      rich_text: [
        {
          text: {
            content: registration.person.phone || ""
          }
        }
      ]
    },
    Email: {
      email: registration.person.email || null
    },
    Cidade: {
      rich_text: [
        {
          text: {
            content: registration.person.city || ""
          }
        }
      ]
    },
    "Data de nascimento": registration.person.birthDate
      ? {
          date: {
            start: registration.person.birthDate
          }
        }
      : undefined,
    "Data da inscricao": {
      date: {
        start: registration.createdAt
      }
    },
    Foto: registration.photo?.url
      ? {
          url: registration.photo.url
        }
      : undefined,
    Observacoes: {
      rich_text: [
        {
          text: {
            content: registration.person.notes || ""
          }
        }
      ]
    }
  };

  const filteredProperties = Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  );

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
      "Content-Type": "application/json",
      "Notion-Version": "2026-03-11"
    },
    body: JSON.stringify({
      parent: {
        type: "data_source_id",
        data_source_id: process.env.NOTION_DATA_SOURCE_ID
      },
      properties: filteredProperties
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Falha ao enviar para o Notion: ${message}`);
  }

  return response.json();
}

module.exports = {
  syncRegistrationToNotion
};
