import { Link } from 'react-router-dom';
import { Brand } from './Navbar';

export default function Footer() {
    return (
        <footer className="mt-24 border-t border-line">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
                <div>
                    <Brand />
                    <p className="mt-3 max-w-sm text-sm text-white/45">
                        Decentralized crowdfunding where startups meet investors on the blockchain.
                    </p>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/55">
                    <Link to="/startups" className="hover:text-white">
                        Startups
                    </Link>
                    <Link to="/campaigns" className="hover:text-white">
                        Campaigns
                    </Link>
                    <Link to="/account" className="hover:text-white">
                        My Account
                    </Link>
                </div>
            </div>
        </footer>
    );
}
