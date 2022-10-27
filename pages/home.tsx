import AppLayout from "src/components/layouts/AppLayout"
import TransitionOpacity from "src/components/TransitionOpacity"
import Typography from "src/components/ui/Typography"
import { withPageAuth } from "src/utils/supabase"
import styled from "styled-components"

import HomeOutlined from "@mui/icons-material/HomeOutlined"

export default function Home() {
    return (
        <TransitionOpacity>
            <Container>
                <Content>
                    <Typography.Title>Accueil</Typography.Title>
                </Content>
            </Container>
        </TransitionOpacity>
    )
}

Home.Layout = AppLayout
Home.Title = "Accueil"
Home.Icon = <HomeOutlined />

const Container = styled.div`
    padding: 100px 25px;
`

const Content = styled.div`
    margin: 25px auto;
    max-width: 700px;
    display: flex;
    flex-direction: column;
`

export const getServerSideProps = withPageAuth()
