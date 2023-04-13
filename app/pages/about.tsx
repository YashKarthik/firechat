import { NextPage } from 'next';

const About: NextPage = () => {
  return (
    <div className='flex flex-col items-start'>
      <h1 className='text-3xl font-bold self-center my-7'>About <span className='font-mono text-green-500'>Firechat</span></h1>

      <div className='ml-24 overflow-clip max-w-4xl'>
        <QandA
          q='What is this? Why did you build this.'
          a='A proof of concept for an idea I had - using smart contracts as a database. I built it to... well, why do artists paint; why do writers write; why to singers sing.'
        />

        <QandA
          q='Why would I use this?'
          a='Probably wont have to. Something like this could be used when all other msging services are banned.'
        />

        <QandA
          q='Is this private?'
          a='Not yet. Im figuring out how to use Metamask for encryption/decryption. Even if the messages are encrypted, a lot of metadata is leaked when interacting with smart contracts; I suppsoe people could use this to send short msgs communicating their username on a more private platform.'
        />

        <QandA
          q='Roadmap / will this be updated?'
          a='Not sure. If something shiny catches my eye.... prod me on twitter / telegram / Farcaster / github.'
        />
      </div>
    </div>
  )
}

export default About;

const QandA = ({ q, a }: { q: string, a: string }) => (
  <div className='my-4'>
    <p className=' font-bold text-gray-500'>{ q }</p>
    <p className='text-gray-300'>{ a }</p>
  </div>
);
