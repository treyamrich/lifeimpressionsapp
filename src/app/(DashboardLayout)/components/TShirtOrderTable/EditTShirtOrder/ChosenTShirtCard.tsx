import { TShirt } from "@/API";
import BlankCard from "../../shared/BlankCard";
import { CardContent, Stack, Typography } from "@mui/material";
import { tshirtSizeToLabel } from "@/app/(DashboardLayout)/inventory/create-tshirt-constants";

const ChosenTShirtCard = ({ tshirt }: { tshirt: TShirt }) => (
    <BlankCard>
        <CardContent>
            <Typography variant="h6" color="textSecondary" style={{ marginBottom: "15px" }}>
                TShirt Details
            </Typography>
            <Stack
                sx={{
                    width: "100%",
                    minWidth: { xs: "300px", sm: "360px", md: "400px" },
                    gap: ".5rem",
                }}>
                    <Typography variant="body1">
                        Style Number: {tshirt.styleNumber}
                    </Typography>
                    <Typography variant="body1">
                        Size: {tshirtSizeToLabel[tshirt.size]}
                    </Typography>
                    <Typography variant="body1">
                        Color: {tshirt.color}
                    </Typography>
            </Stack>
        </CardContent>
    </BlankCard>
)
export default ChosenTShirtCard;