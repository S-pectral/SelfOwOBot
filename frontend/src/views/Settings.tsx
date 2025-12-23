import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Toggle } from '../components/ui/Toggle';
import { Save } from 'lucide-react';

export const Settings = () => {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [guilds, setGuilds] = useState<any[]>([]);
    const [selectedGuild, setSelectedGuild] = useState<string>("");

    useEffect(() => {
        const fetchConfig = async () => {
            // In prod, use relative path. In dev, map to backend port.
            let baseUrl = "";
            if (window.location.host.includes(":5173")) {
                baseUrl = "http://localhost:1243";
            }
            try {
                const [resConfig, resGuilds] = await Promise.all([
                    axios.get(`${baseUrl}/api/get-config`),
                    axios.get(`${baseUrl}/api/guilds`)
                ]);
                setConfig(resConfig.data);
                setGuilds(resGuilds.data);
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        if (guilds.length > 0 && config?.main?.channelId?.[0]) {
            const currentId = config.main.channelId[0];
            const foundGuild = guilds.find(g => g.channels.some((c: any) => c.id === currentId));
            if (foundGuild) {
                setSelectedGuild(foundGuild.id);
            } else if (guilds.length > 0 && !selectedGuild) {
                // Default to first guild if none matches? No, keep empty.
            }
        }
    }, [guilds, config]);

    const handleSave = async () => {
        setSaving(true);
        let baseUrl = "";
        if (window.location.host.includes(":5173")) {
            baseUrl = "http://localhost:1243";
        }
        try {
            const payload = { ...config.main, ...config.settings };
            await axios.post(`${baseUrl}/save-settings`, payload);
            alert("Settings saved!");
        } catch (err) {
            console.error(err);
            alert("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const updateMain = (key: string, value: any) => {
        setConfig((prev: any) => ({
            ...prev,
            main: { ...prev.main, [key]: value }
        }));
    };

    const updateChannel = (channelId: string) => {
        setConfig((prev: any) => ({
            ...prev,
            main: { ...prev.main, channelId: [channelId] }
        }));
    };

    const updateGamble = (key: string, value: any) => {
        setConfig((prev: any) => ({
            ...prev,
            main: {
                ...prev.main,
                autoGamble: { ...prev.main.autoGamble, [key]: value }
            }
        }));
    };

    if (loading) return <div className="p-8 text-white">Loading configuration...</div>;
    if (!config) return <div className="p-8 text-white">Error loading config.</div>;

    const activeGuild = guilds.find(g => g.id === selectedGuild);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-white/90">Settings</h2>
                <Button onClick={handleSave} isLoading={saving} className="bg-green-600 hover:bg-green-700">
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </div>

            {/* Channel Selection */}
            <Card className="border-blue-500/30 bg-blue-500/5">
                <CardHeader>
                    <CardTitle>Bot Channel Selection</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Server</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedGuild}
                            onChange={(e) => setSelectedGuild(e.target.value)}
                        >
                            <option value="">-- Select Server --</option>
                            {guilds.map((g: any) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Channel</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={config.main.channelId?.[0] || ""}
                            onChange={(e) => updateChannel(e.target.value)}
                            disabled={!selectedGuild}
                        >
                            <option value="">-- Select Channel --</option>
                            {activeGuild?.channels.map((c: any) => (
                                <option key={c.id} value={c.id}>#{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2 text-xs text-gray-400">
                        Current Channel ID: {config.main.channelId?.[0] || "None"}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Automation Toggles */}
                <Card>
                    <CardHeader>
                        <CardTitle>Automations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span>Auto Hunt</span>
                            <Toggle checked={config.main.autoHunt} onCheckedChange={(c) => updateMain('autoHunt', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Auto Battle</span>
                            <Toggle checked={config.main.autoBattle} onCheckedChange={(c) => updateMain('autoBattle', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Auto Daily</span>
                            <Toggle checked={config.main.autoDaily} onCheckedChange={(c) => updateMain('autoDaily', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Auto Lootbox</span>
                            <Toggle checked={config.main.autoLootbox} onCheckedChange={(c) => updateMain('autoLootbox', c)} />
                        </div>
                    </CardContent>
                </Card>

                {/* HuntBot Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>HuntBot</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span>Enable HuntBot</span>
                            <Toggle checked={config.main.autoHuntBot} onCheckedChange={(c) => updateMain('autoHuntBot', c)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Auto Trait Upgrade</label>
                            <select
                                className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm shadow-sm transition-colors text-white"
                                value={config.main.autoTrait}
                                onChange={(e) => updateMain('autoTrait', e.target.value)}
                            >
                                <option value="efficiency">Efficiency</option>
                                <option value="duration">Duration</option>
                                <option value="cost">Cost</option>
                                <option value="gain">Gain</option>
                                <option value="exp">Experience</option>
                                <option value="radar">Radar</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Gem Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gem Manager</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Auto Gem Mode</label>
                            <select
                                className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm shadow-sm transition-colors text-white"
                                value={config.main.autoGem}
                                onChange={(e) => updateMain('autoGem', Number(e.target.value))}
                            >
                                <option value="0">Off</option>
                                <option value="1">Max Tier</option>
                                <option value="-1">Min Tier</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Use Special Gems</span>
                            <Toggle checked={config.main.useSpecialGem} onCheckedChange={(c) => updateMain('useSpecialGem', c)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Gambling */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gambling</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span>Auto Coinflip</span>
                            <Toggle checked={config.main.autoGamble?.coinflip} onCheckedChange={(c) => updateGamble('coinflip', c)} />
                        </div>
                        {config.main.autoGamble?.coinflip && (
                            <div className="space-y-1 ml-4 border-l-2 border-white/20 pl-4">
                                <label className="text-xs text-gray-400">Amount</label>
                                <Input type="number" value={config.main.autoGamble.coinflipAmount} onChange={(e) => updateGamble('coinflipAmount', parseInt(e.target.value) || 1)} />
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <span>Auto Slots</span>
                            <Toggle checked={config.main.autoGamble?.slots} onCheckedChange={(c) => updateGamble('slots', c)} />
                        </div>
                        {config.main.autoGamble?.slots && (
                            <div className="space-y-1 ml-4 border-l-2 border-white/20 pl-4">
                                <label className="text-xs text-gray-400">Amount</label>
                                <Input type="number" value={config.main.autoGamble.slotsAmount} onChange={(e) => updateGamble('slotsAmount', parseInt(e.target.value) || 1)} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Inventory & Leveling */}
                <Card>
                    <CardHeader>
                        <CardTitle>Inventory & Leveling</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span>Auto Sell (Common/Uncommon)</span>
                            <Toggle checked={config.main.autoSell} onCheckedChange={(c) => updateMain('autoSell', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Auto Sacrifice (Common/Uncommon)</span>
                            <Toggle checked={config.main.autoSacrifice} onCheckedChange={(c) => updateMain('autoSacrifice', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Auto Level (Spam Quotes)</span>
                            <Toggle checked={config.main.autoLevel} onCheckedChange={(c) => updateMain('autoLevel', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Auto Quest</span>
                            <Toggle checked={config.main.autoQuest} onCheckedChange={(c) => updateMain('autoQuest', c)} />
                        </div>

                    </CardContent>
                </Card>

                {/* Interactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Interactions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span>Auto Cookie</span>
                            <Toggle checked={config.main.autoCookie} onCheckedChange={(c) => updateMain('autoCookie', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Auto Clover</span>
                            <Toggle checked={config.main.autoClover} onCheckedChange={(c) => updateMain('autoClover', c)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target User ID (for Cookie)</label>
                            <Input
                                value={config.main.interactionTargetId || ""}
                                onChange={(e) => updateMain('interactionTargetId', e.target.value)}
                                placeholder="User ID"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Misc Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Miscellanenous</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Webhook URL</label>
                            <Input
                                value={config.main.webhookURL || ""}
                                onChange={(e) => updateMain('webhookURL', e.target.value)}
                                placeholder="https://discord.com/api/webhooks/..."
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
