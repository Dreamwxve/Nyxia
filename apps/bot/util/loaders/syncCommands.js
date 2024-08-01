import { readdirSync } from "node:fs";
import prismaClient from "@nyxia/database";
import { Logger } from "@nyxia/util/functions/util";
import { pathToFileURL } from "node:url";

export default async function syncCommands() {
    const upsertCategoriesAndCommands = async (categoriesData, commandsData) => {
        Logger("event", `Upserting ${categoriesData.length} categories and ${commandsData.length} commands...`);
        await prismaClient.$transaction([
            ...categoriesData.map((x) => prismaClient.commandCategories.upsert(x)),
            ...commandsData.map((x) => prismaClient.commands.upsert(x))
        ]);
        await prismaClient.$disconnect();
    };

    const categoriesData = [];
    const categories = readdirSync(`${process.cwd()}/commands`, { withFileTypes: true })
        .filter((dir) => dir.isDirectory())
        .map((dir) => dir.name);
    const categoryNames = categories.map((x) => x.split("/")[x.split("/").length - 1]);
    for (const category of categoryNames) {
        categoriesData.push({
            where: { name: category },
            update: { name: category },
            create: {
                name: category,
            },
        });
    }

    const slashCommandsDirectories = readdirSync(`${process.cwd()}/commands`, { withFileTypes: true }).filter((dir) => dir.isDirectory());
    const slashCommands = [];
    for (const dir of slashCommandsDirectories) {
        const commands = readdirSync(`${process.cwd()}/commands/` + dir.name, { withFileTypes: true }).filter((file) => file.isFile() && file.name.endsWith(".js"));
        for (const command of commands) {
            slashCommands.push(`${process.cwd()}/commands/` + dir.name + "/" + command.name);
        }
    }

    const commandsData = [];
    for (const slashCommand of slashCommands) {
        let rawPath = slashCommand;
        rawPath = pathToFileURL(rawPath);
        const file = await import(rawPath.href);
        const { default: command } = file;

        if (!command) continue;
        const { name, description, type, run, options } = command;
        if (!name || !description || !type || !run) continue;

        const category = slashCommand.split("/")[slashCommand.split("/").length - 2];

        commandsData.push({
            where: { name },
            update: {
                name,
                description,
                options: options || [],
                category: {
                    connect: {
                        name: category,
                    },
                },
            },
            create: {
                name,
                description,
                options: options || [],
                category: {
                    connect: {
                        name: category,
                    },
                },
            },
        });
    }

    const time = performance.now();
    await upsertCategoriesAndCommands(categoriesData, commandsData);

    const perf = Math.floor((performance.now() - time) / 1000);
    Logger("ready", `Seeded database in ${perf}s`);
}
